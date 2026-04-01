// 服务器“运行时数据”（只存在内存中，不会保存到文件）

export interface ServerRuntimeInterface {
  process: any            // 子进程（node-pty）
  clients: Set<any>       // 当前连接的 WebSocket 客户端
  isRunning: boolean      // 是否正在运行
  pid: number | null      // 进程ID

  logBuffer: string[]     // 日志缓存
  maxLines: number        // 最大日志行数
}