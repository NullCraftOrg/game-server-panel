<script setup lang="ts">
import { useSystemMonitorStore } from '@/stores/SystemMonitorStore'
import formatBytes from '@/utils/format/bytes'
import { formatPercentToTextColor } from '@/utils/format/percentToColor'
import { computed } from 'vue'

const systemMonitorStore = useSystemMonitorStore()
const backendInfo = computed(() => systemMonitorStore.MonitorData?.nodejs_info)

// 计算 Node.js 堆内存使用率
const heapUsagePercent = computed(() => {
    const ram = backendInfo.value?.ram
    if (!ram?.heapTotal) return 0
    return ((ram.heapUsed / ram.heapTotal) * 100)
})
</script>

<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="flex justify-between items-center">
                <h2 class="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <rect width="4" height="6" x="14" y="14" rx="2" />
                            <rect width="4" height="6" x="6" y="4" rx="2" />
                            <path d="M6 20h4m4-10h4M6 14h2v6m6-16h2v6" />
                        </g>
                    </svg>
                    NodeJS内存
                </h2>
            </div>

            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>常驻集大小 (RSS)</span>
                    <span class="font-mono">{{ formatBytes(backendInfo?.ram.rss ?? 0, 1, 'KB') }}</span>
                </div>
                <div class="flex justify-between">
                    <span>堆总大小</span>
                    <span class="font-mono">{{ formatBytes(backendInfo?.ram.heapTotal ?? 0, 1, 'KB') }}</span>
                </div>
                <div class="flex justify-between">
                    <span>堆已使用</span>
                    <span class="font-mono">{{ formatBytes(backendInfo?.ram.heapUsed ?? 0, 1, 'KB') }}</span>
                </div>
            </div>

            <div class="divider my-0"></div>

            <div class="flex justify-between text-xs">
                <span>堆内存使用率</span><span>{{ heapUsagePercent.toFixed(1) }}%</span>
            </div>
            <progress class="progress w-full h-2" :class="formatPercentToTextColor(heapUsagePercent)" max="100"
                :value="heapUsagePercent.toFixed(1)">
            </progress>

            <div class="flex justify-between">
                <span class="text-xs">
                    外部内存:
                    <span class="font-mono font-bold">{{ formatBytes(backendInfo?.ram.external ?? 0, 1, 'KB') }}</span>
                </span>
                <span class="text-xs">
                    ArrayBuffers:
                    <span class="font-mono font-bold">{{ formatBytes(backendInfo?.ram.arrayBuffers ?? 0, 1, 'KB') }}</span>
                </span>
            </div>
        </div>
    </div>
</template>