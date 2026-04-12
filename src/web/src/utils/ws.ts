export interface WSType {
    /** 请优先使用 sendJSON()
     * send()方法为直接发送纯字符串后端目前仅解析JSON
     */
    send: (message: string) => void

    /** 发送特定格式的内容 */
    sendJSON: (message: WebSocketMessage) => void
    close: () => void
    readyState: () => number | undefined
}

// 定义所有允许发送的消息格式
type WebSocketMessage =
    | { type: 'input'; message: string } // 基本输入
    | { type: 'resize'; cols: number; rows: number } // 设置防终端大小

export function createWS(
    uuid: string,
    onMessage: (data: string) => void,
    onOpen?: (ws: WebSocket) => void
): WSType {
    let ws: WebSocket | null = null
    let timer: number | undefined
    let isClosedManually = false // 调用close()手动关闭标识(不触发重连机制)

    function connect(): void {
        const token = localStorage.getItem('token') // token 认证

        ws = new WebSocket(`ws://localhost:${__API_PORT__}?uuid=${uuid}&token=${token}`)

        ws.onmessage = (e: MessageEvent) => {
            onMessage(e.data)
        }

        ws.onopen = () => {
            if (ws && onOpen) {
                console.log('WebSocket 已连接')
                onOpen(ws)
            }
        }

        ws.onclose = () => {
            // 是否手动关闭
            if (isClosedManually) return

            console.log('WebSocket 重连中...', ws)
            timer = window.setTimeout(connect, 2000)
        }
    }

    connect()

    return {
        send: (message: string) => ws?.send(message),

        sendJSON: (message: WebSocketMessage) => ws?.send(JSON.stringify(message)),

        readyState: () => ws?.readyState ?? WebSocket.CLOSED,

        close: () => {
            isClosedManually = true
            if (timer !== undefined) {
                clearTimeout(timer)
            }
            ws?.close()
        }
    }
}