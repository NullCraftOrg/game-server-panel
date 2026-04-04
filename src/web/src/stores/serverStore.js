// stores/serverStore.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { api } from '@/api'

export const useServerStore = defineStore('server', () => {
    // 状态
    const servers = ref([])
    const loading = ref(false)
    const error = ref(null)

    // 获取单个服务器详细信息，并更新到 servers 数组中，不支持轮询，需要自己设置定时器查询。
    async function fetchServerInfo(uuid) {
        loading.value = true
        error.value = null
        try {
            const serverInfo = await api.getServerInfo(uuid)
            // 查找并更新 servers 中对应的项
            const index = servers.value.findIndex(s => s.uuid === uuid)
            if (index !== -1) {
                // 合并现有基础信息和新获取的详细信息
                servers.value[index] = { ...servers.value[index], ...serverInfo }
            } else {
                // 如果数组中没有，可以直接添加（视业务需求）
                servers.value.push(serverInfo)
            }
            // 返回数据
            return serverInfo
        } catch (err) {
            error.value = err.message || '获取服务器信息失败'
            console.error('fetchServerInfo 失败:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // 轮询控制
    let pollingTimer = null
    const pollingInterval = ref(3000)        // 默认3秒
    let isPollingActive = true

    // 获取服务器列表（普通请求）支持轮询
    async function fetchServers() {
        loading.value = true
        error.value = null
        try {
            const data = await api.getServers()
            servers.value = data
        } catch (err) {
            error.value = err.message || '加载失败'
            console.error('fetchServers 失败:', err)
        } finally {
            loading.value = false
        }
    }

    // 启动轮询
    function startPolling() {
        if (pollingTimer) clearInterval(pollingTimer)
        pollingTimer = setInterval(() => {
            // 仅在页面可见且轮询标志为 true 时执行
            if (!isPollingActive || document.hidden) return
            fetchServers()
        }, pollingInterval.value)
    }

    // 停止轮询
    function stopPolling() {
        if (pollingTimer) {
            clearInterval(pollingTimer)
            pollingTimer = null
        }
    }

    // 动态调整轮询间隔（例如根据错误频率）
    function setPollingInterval(interval) {
        pollingInterval.value = interval
        // 重启轮询以应用新间隔
        if (pollingTimer) {
            stopPolling()
            startPolling()
        }
    }

    // 监听页面可见性变化
    function handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停轮询
            stopPolling()
        } else {
            // 页面重新可见时，立即获取一次最新数据，然后重启轮询
            fetchServers().then(() => startPolling())
        }
    }

    // 初始化轮询（在应用启动时调用）
    function initPolling() {
        document.addEventListener('visibilitychange', handleVisibilityChange)
        // 立即获取一次数据
        fetchServers().then(() => startPolling())
    }

    // 清理资源
    function cleanup() {
        stopPolling()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
    }

    // 提供更新单个服务器状态的便捷方法（可用于手动操作后局部更新）
    function updateServerStatus(serverId, isRunning) {
        const server = servers.value.find(s => s.uuid === serverId)
        if (server) server.isRunning = isRunning
    }

    return {
        servers,
        loading,
        error,
        fetchServers,
        fetchServerInfo,
        initPolling,
        cleanup,
        updateServerStatus,
        setPollingInterval,
        startPolling,
        stopPolling
    }
})