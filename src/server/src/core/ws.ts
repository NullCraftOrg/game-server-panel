import { WebSocketServer } from 'ws'
import ServerManager from './serverManager.ts'
import { log } from '../log.ts'
import { verifyToken } from './auth.ts'

export default function InitWebSocket(server: any) {
    const wss = new WebSocketServer({ server })

    wss.on('connection', (ws: any, req: any) => {
        const url = new URL(req.url, 'http://' + req.headers.host)
        const uuid = url.searchParams.get('uuid')
        const token = url.searchParams.get('token')
        if (!token) {
            ws.close(1008, 'Token required');
            return;
        }

        const payload = verifyToken(token);
        if (!payload) {
            ws.close(1008, 'Invalid token');
            return;
        }

        if (!uuid) return ws.close()

        const server = ServerManager.get(uuid)
        if (!server) return ws.close()

        server.clients.add(ws)
        log.debug('[WebSocket]', '已连接至:', uuid, '客户端数量:', server.clients.size)

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
            log.debug('[WebSocket]', '已断开连接:', uuid, '客户端数量:', server.clients.size)
        })
    })
}