import { request, BASE } from "@/api/client"
import type { AuthType } from '@/types/AuthType'
import type { UserType } from '@/types/UserType'

export const PATH = `${BASE}/auth`

export const authApi = {
  getUserInfo: (): Promise<UserType> => request(`${PATH}/me`),

  login: async (authData: string, password: string): Promise<AuthType> => {
    return fetch(`${PATH}/login`, {
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
    const r = await fetch(`${PATH}/register`, {
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