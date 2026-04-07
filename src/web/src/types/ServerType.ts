export interface ServerType {
  uuid: string            // 唯一ID
  name: string            // 服务器名称
  fileName: string        // 启动程序
  command: string         // 启动参数
  cwd: string             // 工作目录
  forceUtf8Mode: boolean // 是否强制UTF-8模式(仅Windows生效)
  usePty: boolean        // 是否启用仿终端模式

  lastStartTime?: number // 上次启动时间戳
  lastStopTime?: number  // 上次停止时间戳
  fileExist?: boolean    // 启动程序是否存在
  isRunning?: boolean,   // 是否正在运行
  isRestarting?: boolean // 是否正在重启
  maxLines?: number      // 最大行数
  pid?: number | null    // 进程ID

  process?: any          // 根据实际定义更精确的类型，比如 NodeJS.Process | null
  clients?: Record<string, any>  // 客户端连接信息
  logBuffer?: string[]      // 日志缓冲数组
}