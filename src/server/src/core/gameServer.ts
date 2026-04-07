import os from 'node:os'
import fs from 'node:fs'
import * as pty from 'node-pty';
import { ChildProcess, spawn } from 'node:child_process'
// 自实现日志
import { log } from '../log.ts'
// 引用接口定义
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts'
import type { ServerRuntimeInterface } from '../interface/ServerRuntimeInterface.ts'

// 服务器类，负责管理游戏服务器的生命周期和状态
export default class GameServer implements ServerConfigInterface, ServerRuntimeInterface {
    // ServerConfigInterface
    uuid: string // 服务器唯一标识符(uuidv4)
    name: string
    fileName: string
    command: string
    cwd: string // 工作目录
    forceUtf8Mode?: boolean // 强兼容UTF-8模式(仅Windows有效用于解决部分游戏乱码问题)
    usePty?: boolean  // 仿终端模式

    // ServerRuntimeInterface
    lastStartTime: number | null
    lastStopTime: number | null
    fileExist: boolean
    isRunning: boolean
    isRestarting: boolean // 是否处于重启状态中
    maxLines: number    // 最大日志行数
    pid: number | null
    process: pty.IPty | ChildProcess | null       // 子进程(node-pty)
    clients: Set<any>   // 当前连接的 WebSocket 客户端(ws.ts)
    logBuffer: string[] // 日志缓存

    // 构造函数，接受服务器配置对象并初始化服务器实例
    constructor(config: ServerConfigInterface) {
        // 初始化配置数据
        this.uuid = config.uuid
        this.name = config.name
        this.fileName = config.fileName
        this.command = config.command
        this.cwd = config.cwd
        this.forceUtf8Mode = config.forceUtf8Mode ?? false // 默认为 false
        this.usePty = config.usePty ?? true // 默认为 true

        // 初始化运行时数据
        this.lastStartTime = null
        this.lastStopTime = null
        this.fileExist = false
        this.process = null
        this.clients = new Set()
        this.isRunning = false
        this.isRestarting = false
        this.maxLines = 10000
        this.pid = null
        this.logBuffer = []
    }

    /**
     * 通过特殊函数来判断 process 是否为 Pty
     * @param process 传入要判断的 process
     * @returns 
     */
    private isPty(process: any): process is pty.IPty {
        return process && typeof process.write === 'function' && typeof process.resize === 'function';
    }

    /**
     * 启动服务器线程
     */
    start(): void {
        if (this.process) return

        try {
            let file: string = this.fileName
            let args: string | string[] = this.command
            const isWindows: boolean = os.platform() === 'win32'

            if (this.forceUtf8Mode && isWindows) {
                const useForceUtf8ModeMsg = "当前使用强兼容UTF-8模式启动服务器。"
                log.warn(`${this.name}(${this.uuid})`, useForceUtf8ModeMsg)
                // 重新设置启动参数
                file = 'cmd.exe'
                args = [
                    '/d',
                    '/s',
                    '/c',
                    `echo ${useForceUtf8ModeMsg}`,
                    '&&',
                    'chcp 65001>nul',
                    '&&',
                    `"${this.fileName}"`,
                    `${this.command}`
                ]
            }

            log.debug(`${this.name}(${this.uuid})`, '启动参数:', file, args, this.cwd)

            // 判断启动方式
            if (this.usePty) {
                // 启动PTY
                this.process = this.spawnPtyProcess(file, args)
                // 绑定事件
                this.bindPtyEvents(this.process)
            }
            else {
                // 启动ChildProcess
                this.process = this.spawnChildProcess(file, args)
                this.bindChildProcessEvents(this.process)
            }

            // 进程启动成功后，记录 PID 和状态，并发送日志消息
            if (this.process.pid) {
                this.pid = this.process.pid
                this.isRunning = true
                this.lastStartTime = Date.now() // 更新启动时间

                const startMsg = ['启动进程:', `${this.name}(${this.uuid})`, 'PID:', this.process.pid].join(' ')
                this.appendLog(startMsg + '\r\n', true)
                log.info(startMsg)
            }
        }
        catch (error: any) {
            this.handleProcessError(error, `启动错误: ${this.name}(${this.uuid})`)
        }
    }

    /**
     * 启动pty线程
     * @param filePath 文件路径
     * @param args 附加命令
     * @returns Pty
     */
    private spawnPtyProcess(filePath: string, args: string | string[]): pty.IPty {
        if (typeof args === 'object') {
            args = args.join(' ')
        }
        return pty.spawn(filePath, args, {
            name: 'xterm-color',
            // rows: this.maxLines, // 行(高度)
            cols: this.maxLines, // 列(宽度)
            cwd: this.cwd,
            env: process.env,
            useConpty: os.platform() === 'win32',
        })
    }

    /**
     * 绑定pty线程的事件
     * @param process 
     */
    private bindPtyEvents(process: pty.IPty): void {
        // 将进程输出通过 WebSocket 广播给所有客户端，并缓存日志
        process.onData((data: any) => {
            this.appendLog(data)
        })

        // 监听进程退出事件，更新状态并发送日志消息
        process.onExit(({ exitCode, signal }: any) => {
            this.process = null
            this.isRunning = false
            this.lastStopTime = Date.now() // 更新停止时间

            const exitMsg = ['进程退出:', `${this.name}(${this.uuid})`, 'ExitCode:', exitCode ?? -1, 'Signal:', signal ?? 'Exit'].join(' ')
            this.appendLog(exitMsg + '\r\n', true)
            log.info(exitMsg)
        })
    }

    /**
     * 通过 node:ChildProcess 启动一些 Pty 无法捕捉的 GUI->CUI 程序
     * @param filePath 执行文件路径
     * @param args 命令行
     * @returns ChildProcess
     */
    private spawnChildProcess(filePath: string, args: string | string[]): ChildProcess {
        this.appendLog('已禁用仿真终端模拟\r\n', true)
        if (typeof args === 'string') {
            args = args.split(' ')
        }
        return spawn(filePath, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: this.cwd,
            env: process.env,
            detached: false,
            shell: false,
            windowsHide: true,
        })
    }

    /**
     * 绑定 node:ChildProcess 的事件
     * @param process 传入要绑定的 ChildProcess
     */
    private bindChildProcessEvents(process: ChildProcess): void {
        // 捕获错误
        process.on('error', (error) => {
            this.handleProcessError(error, `启动错误: ${this.name}(${this.uuid})`)
        })

        // 输出
        process.stdout?.on('data', (data: string) => {
            this.appendLog(data.toString())
        })
        process.stderr?.on('data', (data: string) => {
            this.appendLog(data.toString())
        })

        // 退出
        process.on('exit', (exitCode: any) => {
            this.process = null
            this.isRunning = false
            this.lastStopTime = Date.now() // 更新停止时间

            const exitMsg = ['进程退出:', `${this.name}(${this.uuid})`, 'ExitCode:', exitCode ?? -1].join(' ')
            this.appendLog(exitMsg + '\r\n', true)
            log.info(exitMsg)
        })
    }

    /**
     * 启动错误处理
     */
    private handleProcessError(error: any, customMsg: string = '') {
        const errMsg: string = [customMsg, error.name, error.message].join(' ')
        log.error(errMsg);
        this.appendLog(errMsg + '\r\n', true);
    }

    /**
     * 停止服务器进程
     */
    stop(): void {
        if (!this.process) return // 没有在运行

        try {
            this.process.kill()
        }
        catch (error: any) {
            this.handleProcessError(error, `停止错误: ${this.name}(${this.uuid})`)
        }
    }

    /**
     * 重启服务器进程
     */
    restart(): void {
        // 直接启动
        if (!this.process) {
            this.start()
            return
        }
        // 重启中直接返回
        if (this.isRestarting) {
            log.warn('重启拦截:', `${this.name}(${this.uuid})`, '服务器已在重启中')
            return
        }

        // 设置重启状态，以防多次触发重启
        this.isRestarting = true

        const lastProcess = this.process

        // 公共退出回调
        const onExitCallback = () => {
            this.process = null
            this.isRunning = false
            this.appendLog('正在重新启动服务器...\r\n', true)

            setTimeout(() => {
                this.start()
                this.isRestarting = false // 恢复状态
            }, 1000)
        };

        // 注册对应类型的退出事件
        if (this.isPty(lastProcess)) {
            lastProcess.onExit(onExitCallback)
        } else {
            lastProcess.on('exit', onExitCallback)
        }

        this.stop()
    }

    /**
     * 发送命令到服务器进程
     * @param command 发送内容
     */
    sendCommand(command: Buffer): void {
        if (!this.process) return // 没有在运行

        if (this.isPty(this.process)) {
            this.process.write(command)
        }
        else {
            // for (let i = 0; i < command.length; i++) {
            //     // 替换xtermjs的'\r'为'\n'
            //     if (command[i] === 0x0d) command[i] = 0x0a;
            // }
            // this.process.stdin?.write(command);

            const canWrite = this.process.stdin?.write(command.toString() + '\r\n', (error) => {
                if (error) {
                    console.error("写入失败:", error);
                } else {
                    console.log("数据已成功从 Node.js 进程发出");
                }
            });

            console.log("缓存区状态:", canWrite, command, command.toString() + '\n');
        }
    }

    /**
     * 广播消息并追加到缓存日志中用于读取
     * 注意：非必要内容不建议加入到缓存日志中，可单独通过 broadcast() 发送通知
     * @param data 日志内容
     * @param format 是否格式化内容显示
     */
    appendLog(data: string, format: boolean = false): void {
        if (format) {
            const timestamp = new Date().toLocaleString()
            data = `[${timestamp}] ${data}`
        }

        this.logBuffer.push(data)

        // 移除达到上限值的先前内容
        if (this.logBuffer.length > this.maxLines) {
            this.logBuffer.shift()
        }

        // 写文件日志-考虑是否有必要这个功能
        // fs.appendFile(path, data, () => { })

        // 推送
        this.broadcast(data)
    }

    /**
     * 广播消息给所有客户端
     * @param msg 消息内容
     */
    broadcast(msg: string): void {
        for (const ws of this.clients) {
            if (ws.readyState === 1) {
                ws.send(msg)
            }
        }
    }

    /**
     * 检查可执行文件是否存在
     * @param filePath 文件路径
     * @returns 是否存在
     */
    checkFileExist(filePath: string = this.fileName): boolean {
        const isExist = fs.existsSync(filePath)
        this.fileExist = isExist
        return isExist
    }

}