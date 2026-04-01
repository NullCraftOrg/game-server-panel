import { WebSocketServer } from 'ws'
import ServerManager from './serverManager.ts'

export default function InitWebSocket(server: any) {
    const wss = new WebSocketServer({ server })

    const ip = 'localhost'

    wss.on('connection', (ws: any, req: any) => {
        const url = new URL(req.url, `http://${ip}`)
        const id = url.searchParams.get('id')
        if (!id) return ws.close()

        const srv = ServerManager.get(id)
        if (!srv) return ws.close()

        srv.clients.add(ws)
        console.log(`WebSocket connected: ${id}, total clients: ${srv.clients.size}`)

        // 连接后发送服务器日志缓冲区中的内容
        for (const line of srv.logBuffer) {
            ws.send(line)
        }

        // 接收命令后发送到服务器线程
        ws.on('message', (message: any) => {
            srv.sendCommand(message)
        })

        // 连接关闭时从服务器线程移除
        ws.on('close', () => {
            srv.clients.delete(ws)
        })
    })
}