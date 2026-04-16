import { request, BASE } from "@/api/client"
import type { SystemMonitorType } from '@/types/SystemMonitorType'

export const PATH = `${BASE}/monitor`

export const monitorApi = {
    getMonitor: async (): Promise<SystemMonitorType> => request(`${PATH}`),
}