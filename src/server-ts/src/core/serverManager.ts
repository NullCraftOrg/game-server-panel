import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs'
import path from 'node:path'
import { PATHS } from '../utils/paths.ts'
import GameServer from './gameServer.ts'
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts'

class ServerManager {
    servers: Map<string, GameServer>
    file: string

    constructor() {
        this.servers = new Map()
        this.file = path.join(PATHS.data, '/servers.json') // 存储服务器列表的文件路径
        this.load()
    }

    // 通过Id获取服务器实例信息
    get(id: string): GameServer | undefined {
        return this.servers.get(id)
    }

    // 返回：配置 + 运行状态（仅 isRunning）
    info(id: string): (ServerConfigInterface & { isRunning: boolean }) | undefined {
        const server = this.servers.get(id)
        if (!server) return

        const { id: serverUuid, name, fileName, command, cwd, forceUtf8Mode, isRunning } = server

        return {
            id: serverUuid, name, fileName, command, cwd, forceUtf8Mode, isRunning
        }
    }

    // 服务器列表
    list() {
        return Array.from(this.servers.values()).map(s => ({
            id: s.id,
            name: s.name,
            fileName: s.fileName,
            command: s.command,
            cwd: s.cwd,
            forceUtf8Mode: s.forceUtf8Mode,
            isRunning: s.isRunning
        }))
    }

    // 创建服务器
    create(config: Omit<ServerConfigInterface, 'id'>): GameServer {
        const id = uuidv4()

        const server = new GameServer({
            id,
            ...config
        })

        this.servers.set(id, server)
        this.save()

        return server
    }

    // 更新服务器
    update(id: string, config: Partial<Omit<ServerConfigInterface, 'id'>>): GameServer | undefined {
        const server = this.servers.get(id)
        if (!server) return

        if (config.name !== undefined) server.name = config.name
        if (config.fileName !== undefined) server.fileName = config.fileName
        if (config.command !== undefined) server.command = config.command
        if (config.cwd !== undefined) server.cwd = config.cwd
        if (config.forceUtf8Mode !== undefined) server.forceUtf8Mode = config.forceUtf8Mode

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
            this.servers.set(item.id, server)
        }
    }

    // 将服务器列表保存到文件
    save(): void {
        const data = JSON.stringify(this.list(), null, 2)
        fs.writeFileSync(this.file, data, 'utf-8')
    }

}

export default new ServerManager()