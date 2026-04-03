// 服务器“运行时数据”（只存在内存中，不会保存到文件）

export interface ServerRuntimeInterface {
  isRunning: boolean      // 是否正在运行
  lastStartTime: number | null  // 最后启动时间
  lastStopTime: number | null  // 最后停止时间
  fileExist: boolean

  maxLines: number        // 最大日志行数

  pid: number | null      // 进程ID
  process: any            // 子进程（node-pty）
  clients: Set<any>       // 当前连接的 WebSocket 客户端
  logBuffer: string[]     // 日志缓存
}