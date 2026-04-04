import os from 'node:os'
import fs from 'node:fs'
import pty from 'node-pty'
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
    forceUtf8Mode?: boolean // 强兼容UTF-8模式（仅Windows有效用于解决部分游戏乱码问题）

    // ServerRuntimeInterface
    lastStartTime: number | null
    lastStopTime: number | null
    fileExist: boolean
    isRunning: boolean
    maxLines: number    // 最大日志行数
    pid: number | null
    process: any        // 子进程(node-pty)
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
        this.forceUtf8Mode = config.forceUtf8Mode || false

        // 初始化运行时数据
        this.lastStartTime = null
        this.lastStopTime = null
        this.fileExist = false
        this.process = null
        this.clients = new Set()
        this.isRunning = false
        this.maxLines = 10000
        this.pid = null
        this.logBuffer = []
    }

    /**
     * 启动服务器线程
     */
    start(): void {
        if (this.process) return

        try {
            const isWindows = os.platform() === 'win32'

            if (this.forceUtf8Mode && isWindows) {
                const useForceUtf8ModeMsg = "当前使用强兼容UTF-8模式启动服务器。"

                log.warn(`${this.name}(${this.uuid})`, useForceUtf8ModeMsg)

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
                ]

                this.process = pty.spawn(shell, chcpArgs.join(' '), {
                    name: 'xterm-256color',
                    rows: this.maxLines,
                    cols: this.maxLines,
                    cwd: this.cwd,
                    // windowsHide: true,
                })
            }
            else {
                // 正常方式启动
                this.process = pty.spawn(this.fileName, this.command, {
                    name: 'xterm-256color',
                    rows: this.maxLines,
                    cols: this.maxLines,
                    cwd: this.cwd,
                    // windowsHide: true,
                })
            }

        }
        catch (error: any) {
            const errMsg = ['进程错误:', `${this.name}(${this.uuid})`, '启动失败!', '原因:', error.name, error.message].join(' ')
            log.error(errMsg)
            this.appendLog(errMsg + '\r\n')

            return
        }

        // 进程启动成功后，记录 PID 和状态，并发送日志消息
        if (this.process.pid) {
            this.pid = this.process.pid
            this.isRunning = true
            this.lastStartTime = Date.now() // 更新启动时间

            const startMsg = ['启动进程:', `${this.name}(${this.uuid})`, 'PID:', this.process.pid].join(' ')
            this.appendLog(startMsg + '\r\n')
            log.info(startMsg)
        }

        // 将进程输出通过 WebSocket 广播给所有客户端，并缓存日志
        this.process.onData((data: any) => {
            this.appendLog(data)
        })

        // 监听进程退出事件，更新状态并发送日志消息
        this.process.onExit(({ exitCode, signal }: any) => {
            this.process = null
            this.isRunning = false
            this.lastStopTime = Date.now() // 更新停止时间

            const exitMsg = ['进程退出:', `${this.name}(${this.uuid})`, 'ExitCode:', exitCode ?? -1, 'Signal:', signal ?? 'Exit'].join(' ')
            this.appendLog(exitMsg + '\r\n')
            log.info(exitMsg)
        })
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
            log.error(`停止服务器 ${this.name}(${this.uuid}) 时发生错误:`, error.message)
        }
    }

    /**
     * 发送命令到服务器进程
     * @param command 发送内容
     */
    sendCommand(command: string): void {
        if (!this.process) return // 没有在运行
        this.process.write(command)
    }

    /**
     * 广播消息并追加到缓存日志中用于读取
     * 注意：非必要内容不建议加入到缓存日志中，可单独通过 broadcast() 发送通知
     * @param data 日志内容
     */
    appendLog(data: string): void {
        this.logBuffer.push(data)

        if (this.logBuffer.length > this.maxLines) {
            this.logBuffer.shift()
        }

        // 写文件日志
        // fs.appendFile(this.logFile, data, () => { })

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