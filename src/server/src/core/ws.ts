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

        // 接收命令后发送到服务器线程
        // (20260411: 更改为Json传输，增加type区分输入和调整终端大小)
        // input = 输入命令，resize = 调整终端大小
        ws.on('message', (message: any) => {
            // 解析消息格式
            const data = JSON.parse(message.toString())

            if (data.type === 'init') {
                if (server.isPty(server.process)) {
                    server.process?.resize(data.cols, data.rows)
                    log.debug('收到初始化命令，设置尺寸并发送历史日志', 'Cols:', data.cols, 'Rows:', data.rows)
                }
                // 发送服务器日志缓冲区中的内容
                for (const line of server.logBuffer) {
                    ws.send(line)
                }
            }
            // 前端发送内容
            else if (data.type === 'input') {
                server.sendCommand(data.message)
            }
            // 通过WebSocket调整终端大小时
            else if (data.type === 'resize' && server.isPty(server.process)) {
                server.process?.resize(data.cols, data.rows)
                log.debug('[WebSocket]', '更新终端大小:', uuid, 'Cols:', data.cols, 'Rows:', data.rows)
            }
        })

        // 心跳检测
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        // 连接关闭时从服务器线程移除
        ws.on('close', () => {
            server.clients.delete(ws)
            log.debug('[WebSocket]', '已断开连接:', uuid, '客户端数量:', server.clients.size)
        })
    })
}