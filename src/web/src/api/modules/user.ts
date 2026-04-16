import { request, BASE } from '@/api/client'
import type { UserType } from '@/types/UserType'

export const userApi = {
    getUsers: async (): Promise<UserType[]> => request(`${BASE}/users`),
    updateUser: async (id: number, body: UserType) => request(`${BASE}/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteUser: async (id: number) => request(`${BASE}/users/${id}`, { method: 'DELETE' }),
}
