<script setup lang="ts">
import { computed } from 'vue';
import { useSystemMonitorStore } from '@/stores/SystemMonitorStore'
import formatUptime from '@/utils/format/uptime'
import formatMicroToMillisecond from '@/utils/format/microToMillisecond'

const systemMonitorStore = useSystemMonitorStore()

const appInfo = computed(() => systemMonitorStore.MonitorData?.app_info)
const backendInfo = computed(() => systemMonitorStore.MonitorData?.nodejs_info)

const backendUptime = computed(() => formatUptime(backendInfo.value?.uptime ?? 0));

const totalCpuTimes = computed(() => formatMicroToMillisecond((backendInfo.value?.cpu.user || 0) + (backendInfo.value?.cpu.system || 0)))
const userPercent = computed(() => calculatePercent(backendInfo.value?.cpu.user, backendInfo.value?.cpu.system).toFixed(1))
const systemPercent = computed(() => calculatePercent(backendInfo.value?.cpu.system, backendInfo.value?.cpu.user).toFixed(1))

const fullIPAddress = computed(() => (appInfo.value?.ip ?? '-') + ':' + (appInfo.value?.port ?? '-'))

// 计算 NodeJS 的 CPU user/system 占用时间比 value1 返回value1的结果百分比。
const calculatePercent = (num1: number | null | undefined, num2: number | null | undefined) => {
    const total = (num1 || 0) + (num2 || 0);
    const percent = total ? ((num1 || 0) / total) * 100 : 0;
    return percent;
}

</script>
<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="flex justify-between items-center">
                <h2 class="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <path d="M21 11.693V5m1 17l-1.875-1.875M3 12a9 3 0 0 0 8.697 2.998" />
                            <path d="M3 5v14a9 3 0 0 0 9.28 2.999" />
                            <circle cx="18" cy="18" r="3" />
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                        </g>
                    </svg>
                    后端信息
                </h2>
                <a class="btn btn-xs" :href="`http://${appInfo?.ip}:${appInfo?.port}`" target="_blank"><svg
                        class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <path d="m10 16l4-4l-4-4m-7 4h11"></path>
                            <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                        </g>
                    </svg>
                    访问后端
                </a>
            </div>

            <!-- 基本信息区域 使用 stat 组件 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="stat bg-base-200 rounded-box p-3 border border-base-300 tooltip tooltip-bottom"
                :data-tip="'后端地址:' + fullIPAddress + ' 运行版本:' + (backendInfo?.version ?? '-')">
                    <div class="stat-title">后端地址</div>
                    <div class="stat-value text-xl truncate">{{ fullIPAddress }}</div>
                    <div class="stat-desc">运行版本: {{ backendInfo?.version ?? '-' }}</div>
                </div>
                <div class="stat bg-base-200 rounded-box p-3 border border-base-300 tooltip tooltip-bottom"
                    :data-tip="'运行时间:' + backendUptime + ' PID:' + (backendInfo?.pid ?? '-')">
                    <div class="stat-title">运行时间</div>
                    <div class="stat-value text-xl truncate">{{ backendUptime }}</div>
                    <div class="stat-desc">PID: {{ backendInfo?.pid ?? '-' }}</div>
                </div>
            </div>

            <!-- 分隔线 -->
            <div class="divider my-0"></div>

            <!-- CPU时间总计 -->
            <div class="flex justify-between">
                <span class="font-bold">总计 CPU 时间</span>
                <span class="font-bold font-mono">{{ totalCpuTimes }}</span>
            </div>

            <!-- 堆叠进度条：使用 flex 布局手动构建 -->
            <div class="h-2 flex w-full overflow-hidden rounded-full">
                <!-- 用户态占比：宽度 58% -->
                <div class="bg-primary" :style="{ width: userPercent + '%' }"></div>
                <!-- 系统态占比：宽度 42% -->
                <div class="bg-secondary" :style="{ width: systemPercent + '%' }"></div>
            </div>

            <!-- 图例和数值 -->
            <div class="flex justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full bg-primary"></div>
                    <span class="text-xs">用户态 <span class="font-mono font-bold">{{
                        formatMicroToMillisecond(backendInfo?.cpu.user) }}</span></span>
                    <span class="text-xs text-base-content/50">({{ userPercent + '%' }})</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full bg-secondary"></div>
                    <span class="text-xs">系统态 <span class="font-mono font-bold">{{
                        formatMicroToMillisecond(backendInfo?.cpu.system) }}</span></span>
                    <span class="text-xs text-base-content/50">({{ systemPercent + '%' }})</span>
                </div>
            </div>

        </div>
    </div>

</template>