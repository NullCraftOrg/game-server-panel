import { v4 as uuidv4 } from 'uuid'
import GameServer from './gameServer.ts'
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts'
import { DBServers } from '../db.ts'

// 界定 get()、info()、list() 函数返回的内容(服务器实例信息)
export interface ServerInfo extends ServerConfigInterface {
    fileExist: boolean,
    isRunning: boolean,
    lastStartTime: number | null,
    lastStopTime: number | null,
}

class ServerManager {
    servers: Map<string, GameServer>
    // file: string

    constructor() {
        this.servers = new Map()
        this.load()
    }

    /**
     * 通过uuid获取服务器实例信息
     * @param uuid 服务器唯一uuid
     * @returns 服务器实例信息或undefined
     */
    get(uuid: string): GameServer | undefined {
        // 我想从结构中去掉一些值例如 process、clients、logBuffer 等等
        const server = this.servers.get(uuid)
        if (!server) return
        return server
    }

    // 定义需要剔除的字段(黑名单)
    private readonly serverOmitKeys = ['process', 'clients', 'logBuffer', 'maxLines'] as const;

    /**
     * 工具函数：从 Server 实例中剔除黑名单字段用于返回给前端
     * @param server GameServer
     * @returns 自身的接口 interface ServerInfo extends ServerConfigInterface
     */
    private sanitizeServer(server: GameServer): Omit<ServerInfo, typeof this.serverOmitKeys[number]> {
        const { process, clients, logBuffer, maxLines, ...rest } = server;
        return rest;
    }

    /**
     * 通过uuid获取服务器状态信息
     * @param uuid 服务器唯一uuid
     * @returns 服务器实例信息或undefined
     */
    info(uuid: string): ServerInfo | undefined {
        const server = this.servers.get(uuid)
        if (!server) return

        // 去除不需要的信息，Info信息最好精简来减少轮询性能损耗。
        return this.sanitizeServer(server)
    }

    /**
     * 服务器列表
     * @returns 服务器实例信息数组
     */
    list(): Array<ServerInfo> {
        // 2020406 改为黑名单模式，去掉不需要的。
        return Array.from(this.servers.values()).map(this.sanitizeServer);

        // 老方案：白名单模式-维护起来太麻烦了
        // return Array.from(this.servers.values()).map(s => ({
        //     uuid: s.uuid,
        //     name: s.name,
        //     fileName: s.fileName,
        //     command: s.command,
        //     cwd: s.cwd,
        //     forceUtf8Mode: s.forceUtf8Mode,
        //     usePty: s.usePty,
        //     // 继承同时存在于运行时
        //     fileExist: s.fileExist,
        //     isRunning: s.isRunning,
        //     lastStartTime: s.lastStartTime,
        //     lastStopTime: s.lastStopTime
        // }))
    }

    /**
     * 创建服务器
     * @param config 通过服务器配置对象创建服务器，唯一uuid会自动生成
     * @returns GameServer实例
     */
    create(config: Omit<ServerConfigInterface, 'uuid'>): GameServer {
        // 通过 uuidv4 随机生成服务器的唯一 uuid
        const uuid = uuidv4()
        // 融合数据
        const server = new GameServer({
            uuid,
            ...config
        })
        // 检测可执行文件是否存在
        server.checkFileExist()
        // 存入
        this.servers.set(uuid, server)

        // 数据库插入
        DBServers.add(server)

        return server
    }

    /**
     * 通过服务器唯一uuid更新服务器配置
     * @param uuid 服务器唯一uuid
     * @param config 服务器配置对象
     * @returns 更新后的GameServer实例或undefined
     */
    update(uuid: string, config: Partial<Omit<ServerConfigInterface, 'uuid'>>): GameServer | undefined {
        // 通过唯一uuid获取原数据
        const server = this.servers.get(uuid)
        if (!server) return

        // 更新数据空值检测
        if (config.name !== undefined) server.name = config.name
        if (config.fileName !== undefined) server.fileName = config.fileName
        if (config.command !== undefined) server.command = config.command
        if (config.cwd !== undefined) server.cwd = config.cwd
        if (config.forceUtf8Mode !== undefined) server.forceUtf8Mode = config.forceUtf8Mode
        if (config.usePty != undefined) server.usePty = config.usePty

        // 更新可执行文件是否存在
        server.checkFileExist()

        // 通过 uuid 更新数据
        DBServers.update(uuid, server)

        return server
    }

    /**
     * 删除服务器
     * @param uuid 服务器唯一uuid
     * @returns 被删除的服务器唯一uuid
     */
    delete(uuid: string): string {
        this.servers.delete(uuid)
        // this.save()

        // 通过 uuid 删除数据
        DBServers.delete(uuid)
        return uuid
    }

    /**
     * 从文件加载服务器列表
     */
    load(): void {
        // 新方案：通过 db 加载
        const data: ServerConfigInterface[] = DBServers.getAll()

        if (!data) return

        for (const item of data) {
            const server = new GameServer(item)
            // 载入时更新可执行文件是否存在
            server.checkFileExist()
            this.servers.set(item.uuid, server)
        }
    }

}

export default new ServerManager()