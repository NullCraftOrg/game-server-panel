import os from 'os'
import pty from 'node-pty'

// 引用接口定义
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts'
import type { ServerRuntimeInterface } from '../interface/ServerRuntimeInterface.ts'

// 服务器类，负责管理游戏服务器的生命周期和状态
export default class GameServer implements ServerConfigInterface, ServerRuntimeInterface {
    // ServerConfigInterface
    id: string
    name: string
    fileName: string
    command: string
    cwd: string
    forceUtf8Mode?: boolean

    // ServerRuntimeInterface
    process: any        // 子进程（node-pty）
    clients: Set<any>   // 当前连接的 WebSocket 客户端
    isRunning: boolean
    pid: number | null
    logBuffer: string[] // 日志缓存
    maxLines: number    // 最大日志行数

    // 构造函数，接受服务器配置对象并初始化服务器实例
    constructor(config: ServerConfigInterface) {
        // 初始化配置数据
        this.id = config.id
        this.name = config.name
        this.fileName = config.fileName
        this.command = config.command
        this.cwd = config.cwd
        this.forceUtf8Mode = config.forceUtf8Mode || false

        // 初始化运行时数据
        this.process = null
        this.clients = new Set()
        this.isRunning = false
        this.pid = null
        this.logBuffer = []
        this.maxLines = 10000
    }

    // 启动服务器线程
    start(): void {
        if (this.process) return; // 已经在运行了

        try {
            const isWindows = os.platform() === 'win32'

            if (this.forceUtf8Mode && isWindows) {
                const useForceUtf8ModeMsg = "当前使用强兼容UTF-8模式启动服务器。"

                console.warn(useForceUtf8ModeMsg)

                const shell = 'cmd.exe'
                const chcpArgs = [
                    '/d',
                    '/s',
                    '/c',
                    `echo ${useForceUtf8ModeMsg}`,
                    '&&',
                    'chcp 65001>nul',
                    '&&',
                    'cls',
                    '&&',
                    `"${this.fileName}"`,
                    `${this.command}`
                ];

                this.process = pty.spawn(shell, chcpArgs.join(' '), {
                    name: 'xterm-256color',
                    rows: this.maxLines,
                    cols: this.maxLines,
                    cwd: this.cwd,
                    // windowsHide: true,
                });

            }
            else {
                // 正常方式启动
                this.process = pty.spawn(this.fileName, this.command, {
                    name: 'xterm-256color',
                    rows: this.maxLines,
                    cols: this.maxLines,
                    cwd: this.cwd,
                    // windowsHide: true,
                });
            }

        }
        catch (error: any) {
            const errMsg = ['启动进程:', this.name, '失败!', '原因:', error.name, error.message].join(' ');
            console.error(errMsg);
            this.appendLog(errMsg + '\r\n');

            return;
        }

        // 进程启动成功后，记录 PID 和状态，并发送日志消息
        if (this.process.pid) {
            this.pid = this.process.pid;
            this.isRunning = true;

            const startMsg = ['启动进程:', this.name, 'PID:', this.process.pid].join(' ');
            this.appendLog(startMsg + '\r\n');
            console.info(startMsg);
        }

        // 将进程输出通过 WebSocket 广播给所有客户端，并缓存日志
        this.process.onData((data: any) => {
            this.appendLog(data);
        });

        // 监听进程退出事件，更新状态并发送日志消息
        this.process.onExit(({ exitCode, signal }: any) => {
            this.process = null;
            this.isRunning = false;

            const exitMsg = ['进程退出:', this.name, 'ExitCode:', exitCode ?? -1, 'Signal:', signal ?? 'Exit'].join(' ');
            this.appendLog(exitMsg + '\r\n');
            console.info(exitMsg);
        });
    }

    // 停止服务器进程
    stop(): void {
        if (!this.process) return; // 没有在运行

        try {
            this.process.kill()
        }
        catch (error) {
            console.error(`停止服务器 ${this.name} 时发生错误:`, error)
        }
    }

    // 发送命令到服务器进程
    sendCommand(command: string): void {
        if (!this.process) return; // 没有在运行
        this.process.write(command)
    }

    // 广播消息并追加到缓存日志中用于读取
    // 注意：非必要内容不建议加入到缓存日志中，可单独通过 broadcast() 发送通知
    appendLog(data: string): void {
        this.logBuffer.push(data);

        if (this.logBuffer.length > this.maxLines) {
            this.logBuffer.shift();
        }

        // 写文件日志
        // fs.appendFile(this.logFile, data, () => { });

        // 推送
        this.broadcast(data);
    }

    // 广播消息给所有客户端
    broadcast(msg: string): void {
        for (const ws of this.clients) {
            if (ws.readyState === 1) {
                ws.send(msg);
            }
        }
    }
}