import { request, BASE } from '@/api/client'
import type { ServerType } from '@/types/ServerType'

export const PATH = `${BASE}/servers`

export const serverApi = {

  /** 获取全部服务器 */
  getServers: async (): Promise<ServerType[]> => request(`${PATH}`),

  /** 获取指定服务器(含运行时信息非必要不使用) */
  getServer: async (uuid: string): Promise<ServerType> => request(`${PATH}/${uuid}`),

  /** 获取指定服务器(精简仅保留必要信息，优先使用) */
  getServerInfo: async (uuid: string): Promise<ServerType> => request(`${PATH}/${uuid}/info`),

  /** 启动指定服务器 */
  startServer: async (uuid: string, terminalSize?: { cols: number; rows: number }) => request(`${PATH}/${uuid}/start`, { method: 'POST', body: JSON.stringify(terminalSize ?? {}), }),

  /** 停止指定服务器 */
  stopServer: async (uuid: string) => request(`${PATH}/${uuid}/stop`, { method: 'POST' }),

  /** 重启指定服务器 */
  restartServer: async (uuid: string, terminalSize?: { cols: number; rows: number }) => request(`${PATH}/${uuid}/restart`, { method: 'POST', body: JSON.stringify(terminalSize ?? {}), }),

  /** 创建服务器 */
  createServer: async (data: ServerType) =>
    request(`${PATH}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新服务器 */
  updateServer: async (uuid: string, data: ServerType) =>
    request(`${PATH}/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 删除服务器 */
  deleteServer: async (uuid: string) => request(`${PATH}/${uuid}`, { method: 'DELETE' }),

  /** 获取服务器日志(目前日志使用WS推送，仅保留接口) */
  getServerLog: async (uuid: string) => request(`${PATH}/${uuid}/log`),

}