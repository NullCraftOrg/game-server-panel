export interface WSType {
    send: (message: string) => void
    close: () => void
    readyState: () => number | undefined

}

export function createWS(
    uuid: string,
    onMessage: (data: string) => void,
    onOpen?: (ws: WebSocket) => void
): WSType {
    let ws: WebSocket | null = null
    let timer: number | undefined
    let isClosedManually = false // 调用close()手动关闭标识(不触发重连机制)
    const token = localStorage.getItem('token') // token 认证

    function connect(): void {
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
            // 手动关闭
            if (isClosedManually) return

            console.log('重连中...', ws)
            timer = window.setTimeout(connect, 2000)
        }
    }

    connect()

    return {

        send: (message: string) => ws?.send(message),

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