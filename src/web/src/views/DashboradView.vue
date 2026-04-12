<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import MainTitle from '@/components/MainTitle.vue'
import BackendInfoCard from '@/components/Dashboard/BackendInfoCard.vue'
import ServerInfoCard from '@/components/Dashboard/ServerInfoCard.vue'
import SystemInfoCard from '@/components/Dashboard/SystemInfoCard.vue'
import UsageChartCard from '@/components/Dashboard/UsageChartCard.vue'
import BackendRamCard from '@/components/Dashboard/BackendRamCard.vue'
import EditServerDialog from '@/components/Dialog/EditServerDialog.vue'
import { useServerStore } from '@/stores/ServerStore'
import { useSystemMonitorStore } from '@/stores/SystemMonitorStore'
import formatBytes from '@/utils/format/bytes'
import { formatPercentToTextColor, formatCoresPercentToBgColor } from '@/utils/format/percentToColor'
import type { ServerType } from '@/types/ServerType'

const serverStore = useServerStore()
const systemMonitorStore = useSystemMonitorStore()

const appInfo = computed(() => systemMonitorStore.MonitorData?.app_info ?? null)
const systemInfo = computed(() => systemMonitorStore.MonitorData?.system_info ?? null)
const nodejsInfo = computed(() => systemMonitorStore.MonitorData?.nodejs_info ?? null)

const systemCpuTotalCores = computed(() => systemInfo.value ? systemInfo.value.cpu.total * 100 : 0)
const systemCpuUsageCores = computed(() => {
    if (Array.isArray(systemInfo.value?.cpu.coresUsage) && systemInfo.value.cpu.coresUsage.length) {
        const sum = systemInfo.value.cpu.coresUsage.reduce((acc, cur) => acc + cur, 0)
        return sum.toFixed(1)
    } else {
        return 0
    }
})

// 对话框相关
const dialogVisible = ref(false)

const openCreateDialog = () => {
    dialogVisible.value = true
}

const handleConfirm = (data: ServerType | any) => {
    if (data.uuid) {
        serverStore.updateServerByUUID(data.uuid, data)
        console.log(data)
    } else {
        serverStore.createServer(data)
    }
}

onMounted(() => {
    systemMonitorStore.startPolling();
});

onUnmounted(() => {
    systemMonitorStore.stopPolling();
});
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
                <h3 class="text-xl font-bold">仪表盘</h3>
            </div>
            <div class="text-center text-sm text-base-content/50">
                {{ systemMonitorStore.RefreshTime ? '数据更新于: ' + new
                    Date(systemMonitorStore.RefreshTime).toLocaleString() : '暂无数据' }}
            </div>
        </div>
    </MainTitle>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ServerInfoCard @create="openCreateDialog" />

        <UsageChartCard title="系统内存" desc="已用内存/内存总数" lineColor="rgb(51, 120, 229)"
            areaColorTop="rgba(51, 120, 229, 0.5)" areaColorBottom="rgba(51, 120, 229, 0.2)"
            :data="systemInfo?.ram.usagePercentData" :left="formatBytes(systemInfo?.ram.usage ?? 0, 1)"
            :right="formatBytes(systemInfo?.ram.total ?? 0, 1)" :percent="systemInfo?.ram.usagePercent ?? 0"
            :percent-color="formatPercentToTextColor(systemInfo?.ram.usagePercent ?? 0)">

            <template v-slot:icon>
                <svg class="size-[1.2em] shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2" />
                        <rect width="20" height="10" x="2" y="6" rx="2" />
                    </g>
                </svg>
            </template>
        </UsageChartCard>

        <UsageChartCard class="cursor-pointer" title="系统核心" desc="已用核心/核心总率" lineColor="rgb(12, 119, 151)"
            areaColorTop="rgba(12, 119, 151, 0.6)" areaColorBottom="rgba(12, 119, 151, 0.2)"
            :data="systemInfo?.cpu.usagePercentData" :left="systemCpuUsageCores + '%'"
            :right="systemCpuTotalCores + '%'" :percent="systemInfo?.cpu.usagePercent ?? 0"
            :percent-color="formatPercentToTextColor(systemInfo?.cpu.usagePercent ?? 0)">
            <template v-slot:icon>
                <svg class="size-[1.2em] shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <path d="M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2" />
                        <rect width="16" height="16" x="4" y="4" rx="2" />
                        <rect width="8" height="8" x="8" y="8" rx="1" />
                    </g>
                </svg>
            </template>

            <!-- 悬浮核心数据 -->
            <template v-slot:tooltip>
                <div class="tooltip-content bg-base-200 border border-base-300 max-w-none p-3 rounded-lg shadow">
                    <h3 class="text-xs font-bold mb-2 text-center text-base-content">核心数据(%)</h3>
                    <div class="grid grid-cols-10 gap-1">
                        <div v-for="(num, index) in systemInfo?.cpu.coresUsage"
                            class="w-8 h-8 flex items-center justify-center text-[10px] text-base-content rounded-sm"
                            :class="formatCoresPercentToBgColor(num)" :title="`索引 ${index}: ${num.toFixed(0)}%`">
                            {{ num.toFixed(1) }}
                        </div>
                    </div>
                </div>

            </template>
        </UsageChartCard>

        <BackendInfoCard />

        <SystemInfoCard />

        <BackendRamCard />
    </div>


    <EditServerDialog v-model:visible="dialogVisible" @confirm="handleConfirm">
    </EditServerDialog>
</template>