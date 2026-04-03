<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/api'
import { useServerStore } from '@/stores/serverStore'

import AddServerDialog from '@/components/dialogs/AddServerDialog.vue'
import DashboardUsageCard from '@/components/dashboard/DashboardUsageCard.vue'
import DashboardServerInfoCard from '@/components/dashboard/DashboardServerInfoCard.vue'
import DashboardNodeJsInfoCard from '@/components/dashboard/DashboardNodeJsInfoCard.vue'
import DashboardSystemInfoCard from '@/components/dashboard/DashboardSystemInfoCard.vue'
import DashboardNodeJsRamCard from '@/components/dashboard/DashboardNodeJsRamCard.vue'
import MainTitle from '@/components/MainTitle.vue'

const serverStore = useServerStore()

// 数据
const refreshDate = ref('')
const dashboardData = ref({})
const appInfo = ref({})
const systemInfo = ref({})
const nodejsInfo = ref({})
const systemCpuTotalCores = ref(0)
const systemCpuUsageCores = ref('0')

// 图标 (修正内存图标)
const cpuSvg = `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
    <path d="M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2" />
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="8" height="8" x="8" y="8" rx="1" />
</g>`

const ramSvg = `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
    <path d="M4 8h16M4 16h16M2 4h20v16H2z" />
    <path d="M8 12h8" />
</g>`

// 辅助函数：字节转可读格式
const formatBytes = (bytes, decimals = 2) => {
    if (bytes == null || isNaN(bytes)) return '0B'
    if (bytes === 0) return '0B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + sizes[i]
}

// 辅助函数：秒转天时分秒
const formatUptime = (seconds) => {
    if (seconds == null || isNaN(seconds) || seconds < 0) return '0秒'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const parts = []
    if (days > 0) parts.push(`${days}天`)
    if (hours > 0) parts.push(`${hours}小时`)
    if (minutes > 0) parts.push(`${minutes}分钟`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)
    return parts.join('')
}

// 计算 Node.js 堆内存使用率
const heapUsagePercent = computed(() => {
    const ram = nodejsInfo.value?.ram
    if (!ram?.heapTotal) return 0
    return ((ram.heapUsed / ram.heapTotal) * 100).toFixed(1)
})

const percentColor = (percent) => {
    // 处理无效值
    if (percent == null || isNaN(percent)) {
        return percentColorMap.neutral; // 或者默认颜色
    }

    // 明确区间
    if (percent >= 80 && percent <= 100) {
        return percentColorMap.error;
    } else if (percent >= 60 && percent < 80) {
        return percentColorMap.warning;
    } else if (percent >= 0 && percent < 60) {
        return percentColorMap.success;
    } else {
        // 负数或大于100的情况
        return percentColorMap.neutral;
    }
};

const percentColorMap = {
  neutral: 'text-neutral',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error'
}

// 获取监控数据
async function getMonitorData() {
    try {
        dashboardData.value = await api.getMonitor()
        refreshDate.value = new Date().toLocaleString()
        appInfo.value = dashboardData.value.app_info || {}
        systemInfo.value = dashboardData.value.system_info || {}
        nodejsInfo.value = dashboardData.value.nodejs_info || {}

        // 计算 CPU 核心使用总和与最大总和
        const coresUsage = systemInfo.value.cpu?.coresUsage
        if (Array.isArray(coresUsage) && coresUsage.length) {
            const sum = coresUsage.reduce((acc, cur) => acc + cur, 0)
            systemCpuUsageCores.value = sum.toFixed(1)
        } else {
            systemCpuUsageCores.value = '0'
        }

        const totalCores = systemInfo.value.cpu?.total ?? 0
        systemCpuTotalCores.value = totalCores * 100
    } catch (error) {
        console.error('获取监控数据失败:', error)
    }
}

// 新建服务器
async function create(data) {
    try {
        await api.createServer({
            name: data.name,
            fileName: data.fileName,
            command: data.command,
            cwd: data.cwd,
            forceUtf8Mode: data.forceUtf8Mode
        })
        await serverStore.fetchServers()
        await getMonitorData()
        console.log('成功创建服务器。')
        dialogVisible.value = false // 关闭对话框
    } catch (error) {
        console.error('创建服务器失败:', error)
        // 可添加用户错误提示
    }
}

// 定时器
let timer = null

onMounted(async () => {
    await getMonitorData()
    timer = setInterval(() => getMonitorData(), 3000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

// 对话框相关
const dialogVisible = ref(false)
const currentServer = ref(null)

const openCreateDialog = () => {
    currentServer.value = null
    dialogVisible.value = true
}

const handleConfirm = (data) => {
    create(data)
}
</script>

<template>
    <MainTitle>
        <div class="flex justify-between mb-3">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                    </g>
                </svg>
                <h3 class="text-xl">仪表盘</h3>
            </div>
            <div class="text-center text-sm text-base-content/50">
                数据更新于 {{ refreshDate }}
            </div>
        </div>
    </MainTitle>

    <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <DashboardServerInfoCard :all="appInfo.servers?.total" :running="appInfo.servers?.running"
                @create="openCreateDialog" />

            <DashboardUsageCard title="系统内存" desc="已用内存/内存总数" :left="formatBytes(systemInfo.ram?.usage ?? 0, 1)"
                :right="formatBytes(systemInfo.ram?.total ?? 0, 1)" :percent="systemInfo.ram?.usagePercent ?? 0"
                :percent-color="percentColor(systemInfo.ram?.usagePercent ?? 0)">
                <svg class="size-[1.2em] shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2" />
                        <rect width="20" height="10" x="2" y="6" rx="2" />
                    </g>

                </svg>
            </DashboardUsageCard>


            <DashboardUsageCard title="系统核心" desc="已用核心/核心总率" :left="systemCpuUsageCores + '%'"
                :right="systemCpuTotalCores + '%'" :percent="systemInfo.cpu?.usagePercent ?? 0"
                :desc="systemInfo.cpu?.model + ` (${systemInfo.cpu?.arch})`"
                :percent-color="percentColor(systemInfo.cpu?.usagePercent ?? 0)">
                <svg class="size-[1.2em] shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <path d="M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2" />
                        <rect width="16" height="16" x="4" y="4" rx="2" />
                        <rect width="8" height="8" x="8" y="8" rx="1" />
                    </g>
                </svg>
            </DashboardUsageCard>

            <DashboardNodeJsInfoCard :ip="appInfo?.ip" :port="appInfo?.port" :pid="nodejsInfo?.pid"
                :version="nodejsInfo?.version" :uptime="formatUptime(nodejsInfo?.uptime)"
                :cpuUser="nodejsInfo.cpu?.user" :cpuSystem="nodejsInfo.cpu?.system" />


            <DashboardSystemInfoCard :hostname="systemInfo?.hostname" :uptime="formatUptime(systemInfo?.uptime)"
                :os-type="systemInfo.os?.type" :os-release="systemInfo.os?.release" :platform="systemInfo.os?.platform"
                :cpu-model="systemInfo.cpu?.model" :cpu-arch="systemInfo.cpu?.arch" />

            <DashboardNodeJsRamCard :rss="formatBytes(nodejsInfo.ram?.rss)"
                :heap-total="formatBytes(nodejsInfo.ram?.heapTotal)" :heap-used="formatBytes(nodejsInfo.ram?.heapUsed)"
                :heap-percent="heapUsagePercent" :external="formatBytes(nodejsInfo.ram?.external)"
                :array-buffers="formatBytes(nodejsInfo.ram?.arrayBuffers)"
                :percent-color="percentColor(heapUsagePercent)" />
        </div>
    </div>

    <AddServerDialog v-model:visible="dialogVisible" :server="currentServer" @confirm="handleConfirm" />
</template>