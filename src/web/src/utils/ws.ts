export interface WSType {
    /** 请优先使用 sendJSON()
     * send()方法为直接发送纯字符串后端目前仅解析JSON
     */
    send: (message: string) => void

    /** 发送特定格式的内容 */
    sendJSON: (message: WebSocketMessage) => void

    /** 手动调用关闭方法，不重连 */
    close: () => void

    /** 当前连接状态 */
    readonly readyState: number

    /** WS是否打开连接回调 */
    onopen?: (ev: Event) => void
    /** WS消息回调 */
    onmessage?: (ev: MessageEvent) => void
    /** WS关闭事件回调 */
    onclose?: (ev: CloseEvent) => void
    /** WS错误事件回调 */
    onerror?: (ev: Event) => void
}

// 定义所有允许发送的消息格式
type WebSocketMessage =
    | { type: 'init'; cols: number; rows: number } // 初始化并发送尺寸
    | { type: 'input'; message: string } // 基本输入
    | { type: 'resize'; cols: number; rows: number } // 设置防终端大小

export function createWS(uuid: string): WSType {
    let ws: WebSocket | null = null
    let timer: number | undefined
    let isClosedManually = false

    // 提供给外部设置的事件处理器
    const wrapper: WSType = {
        //非必要不使用，优先使用sendJSON()
        send: (message: string) => ws?.send(message),

        sendJSON: (message: WebSocketMessage) => ws?.send(JSON.stringify(message)),

        get readyState() {
            return ws?.readyState ?? WebSocket.CLOSED
        },

        // 手动关闭
        close: () => {
            isClosedManually = true
            if (timer !== undefined) {
                clearTimeout(timer)
            }
            ws?.close()
        },

        /** 事件占位(由外部赋值) */
        onopen: undefined,
        onmessage: undefined,
        onclose: undefined,
        onerror: undefined
    }

    function connect(): void {
        const token = localStorage.getItem('token') || ''
        ws = new WebSocket(
            `ws://localhost:${__API_PORT__}?uuid=${uuid}&token=${token}`
        )

        ws.onopen = (ev: Event) => {
            console.log('WebSocket 已连接')
            wrapper.onopen?.(ev)
        }

        ws.onmessage = (ev: MessageEvent) => {
            wrapper.onmessage?.(ev)
        }

        ws.onerror = (ev: Event) => {
            wrapper.onerror?.(ev)
        }

        ws.onclose = (ev: CloseEvent) => {
            wrapper.onclose?.(ev)

            // 如果不是手动关闭，则自动重连
            if (!isClosedManually) {
                console.log('WebSocket 重连中...')
                timer = window.setTimeout(connect, 2000)
            }
        }
    }

    connect()
    return wrapper
}