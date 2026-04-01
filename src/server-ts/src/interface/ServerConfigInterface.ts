// 服务器持久化配置数据（会保存到文件 data\servers.json 后期可能会改造成db）
// 这些是长期存在的数据

export interface ServerConfigInterface {
  id: string              // 唯一ID（uuid）
  name: string            // 服务器名称
  fileName: string        // 启动程序（例如：java.exe / hlds.exe）
  command: string         // 启动参数
  cwd: string             // 工作目录
  forceUtf8Mode?: boolean // 是否强制UTF-8模式（Windows用）
}