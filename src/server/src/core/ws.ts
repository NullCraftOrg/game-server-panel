import { WebSocketServer } from 'ws'
import ServerManager from './serverManager.ts'
import { log } from '../log.ts'

export default function InitWebSocket(server: any) {
    const wss = new WebSocketServer({ server })

    const ip = 'localhost'

    wss.on('connection', (ws: any, req: any) => {
        const url = new URL(req.url, `http://${ip}`)
        const id = url.searchParams.get('id')
        if (!id) return ws.close()

        const server = ServerManager.get(id)
        if (!server) return ws.close()

        server.clients.add(ws)
        log.debug('[WebSocket]', '已连接至:', id, '客户端数量:', server.clients.size)

        // 连接后发送服务器日志缓冲区中的内容
        for (const line of server.logBuffer) {
            ws.send(line)
        }

        // 接收命令后发送到服务器线程
        ws.on('message', (message: any) => {
            server.sendCommand(message)
        })

        // 连接关闭时从服务器线程移除
        ws.on('close', () => {
            server.clients.delete(ws)
            log.debug('[WebSocket]', '已断开连接:', id, '客户端数量:', server.clients.size)
        })
    })
}