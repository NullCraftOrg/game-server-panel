<script setup lang="ts">
import { useSystemMonitorStore } from '@/stores/SystemMonitorStore'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Countdown from '@/components/Countdown.vue'

defineEmits(['create'])

const systemMonitorStore = useSystemMonitorStore()
const appInfo = computed(() => systemMonitorStore.MonitorData?.app_info)

const totalServers = computed(() => appInfo.value?.servers.total || 0)
const runningServers = computed(() => appInfo.value?.servers.running || 0)

const showFirst = ref(true)
let timer: any = null

watch(runningServers, (newVal) => {
    if (newVal > 0) {
        startTimer()
    } else {
        stopTimer()
    }
})

function startTimer() {
    timer = setInterval(() => {
        showFirst.value = !showFirst.value
    }, 1000)
}

function stopTimer() {
    if (timer) clearInterval(timer)
    showFirst.value = true
}

onUnmounted(() => {
    stopTimer()
})
</script>

<template>
    <div class="stats bg-base-100 shadow">
        <div class="stat">
            <div class="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                        <path d="M6 6h.01M6 18h.01" />
                    </g>
                </svg>
            </div>
            <div class="stat-title">全部服务器</div>
            <div class="stat-value text-primary">
                <Countdown :count="totalServers" />
            </div>
            <div class="stat-desc">
                <button class="btn btn-xs" @click="$emit('create')">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="M5 12h14m-7-7v14" />
                    </svg>
                    新建服务器
                </button>
            </div>
        </div>

        <div class="stat">
            <div class="stat-figure text-success">
                <!-- 两个状态的图标，交替显示 第一个是走第二个是跑 -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="inline-block h-8 w-8 stroke-current">
                    <g v-show="showFirst" fill="none" stroke="currentColor" stroke-linecap="round"
                        stroke-linejoin="round" stroke-width="2">
                        <path d="M12 4a1 1 0 1 0 2 0a1 1 0 1 0-2 0M7 21l3-4m6 4l-2-4l-3-3l1-6" />
                        <path d="m6 12l2-3l4-1l3 3l3 1" />
                    </g>

                    <g v-show="!showFirst" fill="none" stroke="currentColor" stroke-linecap="round"
                        stroke-linejoin="round" stroke-width="2">
                        <path d="M12 4a1 1 0 1 0 2 0a1 1 0 1 0-2 0M4 17l5 1l.75-1.5M15 21v-4l-4-3l1-6" />
                        <path d="M7 12V9l5-1l3 3l3 1" />
                    </g>
                </svg>
            </div>
            <div class="stat-title">
                正在运行
            </div>
            <div class="stat-value text-success">
                <Countdown :count="runningServers" />
            </div>
            <div class="stat-desc">
                <RouterLink to="/servers" class="btn btn-xs">
                    查看列表
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <path d="m10 16l4-4l-4-4m-7 4h11" />
                            <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
                        </g>
                    </svg>
                </RouterLink>
            </div>
        </div>

    </div>

</template>