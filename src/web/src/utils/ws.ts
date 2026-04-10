export interface WSType {
    send: (msg: string) => void
    close: () => void
    readyState: () => number | undefined
}

export function createWS(uuid: string, onMessage: (data: string) => void): WSType {
    let ws: WebSocket | undefined
    let timer: number | undefined
    let isClosedManually = false // 调用close()手动关闭标识(不触发重连机制)
    const token = localStorage.getItem('token') // token 认证
    
    function connect(): void {
        ws = new WebSocket(`ws://localhost:${__API_PORT__}?uuid=${uuid}&token=${token}`)

        ws.onmessage = (e: MessageEvent) => {
            onMessage(e.data)
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
        send: (msg: string) => ws?.send(msg),
        
        readyState: () => ws?.readyState,

        close: () => {
            isClosedManually = true
            if (timer !== undefined) {
                clearTimeout(timer)
            }
            ws?.close()
        }
    }
}