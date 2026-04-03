import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs'
import path from 'node:path'
import { PATHS } from '../utils/paths.ts'
import GameServer from './gameServer.ts'
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts'

// 界定 get()、info()、list() 函数返回的内容
export interface ServerInfo extends ServerConfigInterface {
    fileExist: boolean,
    isRunning: boolean,
    lastStartTime: number | null,
    lastStopTime: number | null,
}

class ServerManager {
    servers: Map<string, GameServer>
    file: string

    constructor() {
        this.servers = new Map()
        this.file = path.join(PATHS.data, '/servers.json') // 存储服务器列表的文件路径
        this.load()
    }

    // 通过Id获取服务器实例信息
    get(id: string): ServerInfo | undefined {
        return this.servers.get(id)
    }

    // 返回：配置 + 运行状态（仅 isRunning）
    info(id: string): ServerInfo | undefined {
        const server = this.servers.get(id)
        if (!server) return

        const { id: serverUuid, name, fileName, command, cwd, forceUtf8Mode, fileExist, isRunning, lastStartTime, lastStopTime } = server
        return {
            id: serverUuid, name, fileName, command, cwd, forceUtf8Mode, fileExist, isRunning, lastStartTime, lastStopTime
        }
    }

    // 服务器列表
    list(): Array<ServerInfo> {
        return Array.from(this.servers.values()).map(s => ({
            id: s.id,
            name: s.name,
            fileName: s.fileName,
            command: s.command,
            cwd: s.cwd,
            forceUtf8Mode: s.forceUtf8Mode,
            // 继承同时存在于运行时
            fileExist: s.fileExist,
            isRunning: s.isRunning,
            lastStartTime: s.lastStartTime,
            lastStopTime: s.lastStopTime
        }))
    }

    // 创建服务器
    create(config: Omit<ServerConfigInterface, 'id'>): GameServer {
        // 通过 uuidv4 随机生成服务器的唯一 Id
        const id = uuidv4()
        // 融合数据
        const server = new GameServer({
            id,
            ...config
        })
        // 检测可执行文件是否存在
        server.checkFileExist()
        // 存入
        this.servers.set(id, server)
        this.save()
        return server
    }

    // 更新服务器
    update(id: string, config: Partial<Omit<ServerConfigInterface, 'id'>>): GameServer | undefined {
        // 通过唯一ID获取原数据
        const server = this.servers.get(id)
        if (!server) return

        // 更新数据
        if (config.name !== undefined) server.name = config.name
        if (config.fileName !== undefined) server.fileName = config.fileName
        if (config.command !== undefined) server.command = config.command
        if (config.cwd !== undefined) server.cwd = config.cwd
        if (config.forceUtf8Mode !== undefined) server.forceUtf8Mode = config.forceUtf8Mode

        // 更新可执行文件是否存在
        server.checkFileExist()
        this.save()
        return server
    }

    // 删除服务器
    delete(id: string): string {
        this.servers.delete(id)
        this.save()
        return id
    }

    // 从文件加载服务器列表
    // TODO: 可能要改造成db
    load(): void {
        if (!fs.existsSync(this.file)) return

        const data: ServerConfigInterface[] = JSON.parse(fs.readFileSync(this.file, 'utf-8'))

        for (const item of data) {
            const server = new GameServer(item)
            // 载入时更新可执行文件是否存在
            server.checkFileExist()
            this.servers.set(item.id, server)
        }
    }

    // 将服务器列表保存到文件
    save(): void {
        // 确保数据目录存在
        const dir = path.dirname(this.file)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        // 只保存配置和运行状态，剔除运行时类信息
        const data = this.list().map((
            {
                fileExist,
                isRunning,
                lastStartTime,
                lastStopTime,
                ...rest
            }
        ) => rest)
        fs.writeFileSync(this.file, JSON.stringify(data, null, 2), 'utf-8')
    }

}

export default new ServerManager()