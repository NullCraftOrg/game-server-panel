<script setup>
import { computed } from 'vue'

const props = defineProps(['ip', 'port', 'pid', 'version', 'uptime', 'cpuUser', 'cpuSystem'])

// 辅助函数：微秒转毫秒
const formatCpuMicro = (microseconds) => {
    if (microseconds == null || isNaN(microseconds)) return '0 µs'
    if (microseconds < 1000) return `${microseconds} µs`
    return `${(microseconds / 1000).toFixed(1)} ms`
}

// 计算 NodeJS 的 CPU user/system 占用时间比 value1 返回value1的结果百分比。
const nodejsCpuPercent = (value1, value2) => {
    const total = value1 + value2;
    const percent = (value1 / total) * 100;
    return percent;
}

const totalCpuTimes = computed(() => formatCpuMicro(props.cpuUser + props.cpuSystem))
const userPercent = computed(() => nodejsCpuPercent(props.cpuUser, props.cpuSystem).toFixed(1))
const systemPercent = computed(() => nodejsCpuPercent(props.cpuSystem, props.cpuUser).toFixed(1))

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
                <a class="btn btn-xs" :href="`http://${props.ip}:${props.port}`" target="_blank"><svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <path d="m10 16l4-4l-4-4m-7 4h11"></path>
                            <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                        </g>
                    </svg>
                    访问后端</a>
            </div>

            <!-- 基本信息区域 使用 stat 组件 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="stat bg-base-200 rounded-box p-3 border-1 border-base-300">
                    <div class="stat-title">后端地址</div>
                    <div class="stat-value text-xl truncate">{{ `${props.ip ?? '-'}:${props.port ?? '-'}` }}</div>
                    <div class="stat-desc">运行版本: {{ props.version ?? '-' }}</div>
                </div>
                <div class="stat bg-base-200 rounded-box p-3 border-1 border-base-300">
                    <div class="stat-title">运行时间</div>
                    <div class="stat-value text-xl truncate">{{ props.uptime ?? '-' }}</div>
                    <div class="stat-desc">PID: {{ props.pid ?? '-' }}</div>
                </div>
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
                    <span class="text-xs">用户态 <span class="font-mono font-bold">{{ formatCpuMicro(props.cpuUser)
                            }}</span></span>
                    <span class="text-xs text-base-content/50">({{ userPercent + '%' }})</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full bg-secondary"></div>
                    <span class="text-xs">系统态 <span class="font-mono font-bold">{{ formatCpuMicro(props.cpuSystem)
                            }}</span></span>
                    <span class="text-xs text-base-content/50">({{ systemPercent + '%' }})</span>
                </div>
            </div>

            <!-- 分隔线与总计 -->
            <div class="divider my-0"></div>
            <div class="flex justify-between">
                <span class="font-semibold">总计 CPU 时间</span>
                <span class="font-mono font-bold">{{ totalCpuTimes }}</span>
            </div>
        </div>
    </div>
</template>