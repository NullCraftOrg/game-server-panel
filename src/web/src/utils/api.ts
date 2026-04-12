import type { ServerType } from "@/types/ServerType"
import type { AuthType } from '@/types/AuthType'
import type { UserType } from '@/types/UserType'

const BASE = `http://localhost:${__API_PORT__}/api`

// 从 localStorage 获取 token
function getToken(): string | null {
  return localStorage.getItem('token')
}

// 处理 401 未授权
function handleUnauthorized() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // 如果当前不在登录页，跳转
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 通用请求封装
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // 处理 401
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('未授权，请重新登录')
  }

  // 如果是 204 No Content 或不需要解析 JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  // 正常响应解析 JSON
  if (response.ok) {
    return response.json()
  }

  // 其他错误状态
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || `请求失败 (${response.status})`)
}

export const authApi = {
  getUserInfo: (): Promise<UserType> => request(`${BASE}/auth/me`),

  login: async (authData: string, password: string): Promise<AuthType> => {
    return fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authData, password }),
    }).then(r => {
      if (!r.ok) {
        throw new Error('登录失败')
      }
      return r.json() as Promise<AuthType>
    })
  },

  register: async (email: string, username: string, password: string): Promise<AuthType> => {
    const r = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })
    if (!r.ok) {
      throw new Error('注册失败')
    }
    return await (r.json() as Promise<AuthType>)
  },
}

export const userApi = {
  getUsers: async (): Promise<UserType[]> => request(`${BASE}/users`),
}

export const api = {

  getMonitor: () => request(`${BASE}/monitor`),

  /** 获取全部服务器 */
  getServers: async (): Promise<ServerType[]> => request(`${BASE}/servers`),

  /** 获取指定服务器(含运行时信息非必要不使用) */
  getServer: async (uuid: string): Promise<ServerType> => request(`${BASE}/servers/${uuid}`),

  /** 获取指定服务器(精简仅保留必要信息，优先使用) */
  getServerInfo: async (uuid: string): Promise<ServerType> => request(`${BASE}/servers/${uuid}/info`),

  /** 启动指定服务器 */
  startServer: async (uuid: string) => request(`${BASE}/servers/${uuid}/start`, { method: 'POST' }),

  /** 停止指定服务器 */
  stopServer: async (uuid: string) => request(`${BASE}/servers/${uuid}/stop`, { method: 'POST' }),

  /** 重启指定服务器 */
  restartServer: async (uuid: string) => request(`${BASE}/servers/${uuid}/restart`, { method: 'POST' }),

  /** 创建服务器 */
  createServer: async (data: ServerType) =>
    request(`${BASE}/servers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新服务器 */
  updateServer: async (uuid: string, data: ServerType) =>
    request(`${BASE}/servers/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 删除服务器 */
  deleteServer: async (uuid: string) => request(`${BASE}/servers/${uuid}`, { method: 'DELETE' }),

  /** 获取服务器日志(目前日志使用WS推送，仅保留接口) */
  getServerLog: async (uuid: string) => request(`${BASE}/servers/${uuid}/log`),
}
