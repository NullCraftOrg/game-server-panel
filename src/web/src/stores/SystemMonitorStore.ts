import { defineStore } from "pinia"
import { ref } from "vue"
import { api } from "@/utils/api"
import type { SystemMonitorType } from "@/types/SystemMonitorType"

export const useSystemMonitorStore = defineStore("monitor", () => {
    // 监控数据
    const MonitorData = ref<SystemMonitorType | null>(null)
    // 数据刷新时间戳
    const RefreshTime = ref<number>(0)
    // 轮询定时器
    let timer: number | null = null

    /**
     * 请求监控数据
     */
    async function fetchMonitorData() {
        try {
            MonitorData.value = await api.getMonitor()
            RefreshTime.value = Date.now()
            console.debug("监控数据已更新:", MonitorData.value?.app_info.ip)
        }
        catch (error) {
            console.error("请求监控数据失败:", "错误信息:", error)
        }
    }

    /**
     * 启动轮询
     * @param intervalMs 毫秒，默认1000ms
     */
    function startPolling(intervalMs: number = 1000):void {
        if (timer) return // 防止重复启动
        // 立即请求一次
        fetchMonitorData()
        // 设置定时器
        timer = window.setInterval(() => {
            fetchMonitorData()
        }, intervalMs)
    }

    /**
     * 停止轮询
     */
    function stopPolling():void {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }

    return { MonitorData, RefreshTime, fetchMonitorData, startPolling, stopPolling }
})