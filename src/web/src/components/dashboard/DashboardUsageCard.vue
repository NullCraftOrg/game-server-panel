<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: String,
    left: [String, Number],
    right: [String, Number],
    percent: [String, Number],
    desc: String,
    percentColor: String,

    lineColor: {
        type: String,
        default: 'rgb(0,200,150)'
    },
    areaColorTop: {
        type: String,
        default: 'rgba(0,200,150,0.4)'
    },
    areaColorBottom: {
        type: String,
        default: 'rgba(0,200,150,0.05)'
    },
    // 折线宽度(像素单位)
    strokeWidth: {
        type: Number,
        default: 1.5
    },
    data: {
        type: Array,
        default: () => []
    },
})

// 随机 ID 用于渐变定义
const areaGradId = `areaGrad-${Math.random()}`;

// 数据到 0-100 范围
const normalized = computed(() =>
    props.data.map(v => Math.max(0, Math.min(100, v)))
)

// 计算每个数据点在 SVG 中的水平位置
const step = computed(() =>
    normalized.value.length > 1
        ? 100 / (normalized.value.length - 1)
        : 100
)

// 计算路径
const linePath = computed(() => {
    const data = normalized.value
    if (!data.length) return ''
    let d = ''
    data.forEach((val, i) => {
        const x = i * step.value
        const y = 100 - val
        if (i === 0) d += `M ${x} ${y}`
        else d += ` L ${x} ${y}`
    })
    return d
})

// 计算区域路径
const areaPath = computed(() => {
    const data = normalized.value
    if (!data.length) return ''
    let d = `M 0 100`
    data.forEach((val, i) => {
        const x = i * step.value
        const y = 100 - val
        d += ` L ${x} ${y}`
    })
    d += ` L 100 100 Z`
    return d
})
</script>

<template>
    <div class="card bg-base-100 shadow">

        <svg class="absolute inset-0 w-full h-full pointer-events-none rounded-box" preserveAspectRatio="none" viewBox="0 0 100 100">
            <!-- 定义渐变 -->
            <defs>
                <linearGradient :id="areaGradId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="areaColorTop" />
                    <stop offset="100%" :stop-color="areaColorBottom" />
                </linearGradient>
            </defs>

            <!-- 填充渐变 -->
            <path :d="areaPath" :fill="`url(#${areaGradId})`" class="transition-all duration-500" />

            <!-- 添加折线 -->
            <path :d="linePath" fill="none" :stroke="lineColor" vector-effect="non-scaling-stroke"
                :stroke-width="strokeWidth" stroke-linejoin="round" stroke-linecap="round"
                class="transition-all duration-500" />
        </svg>

        <div class="relative z-10 stat">
            <div class="stat-figure ">
                <div class="glass radial-progress" :class="percentColor" role="progressbar" style="--size: 3rem;" :style="{ '--value': Math.round(percent) }">{{ Math.round(percent) }}</div>
            </div>
            <div class="stat-title">{{ title ?? '-' }}</div>
            <div class="stat-value">{{ left ?? '-' }}<span class="text-2xl">/{{ right ?? '-' }}</span></div>
            <div class="stat-desc overflow-hidden flex items-center gap-1">
                <slot></slot>
                <p>{{ desc ?? '-' }}</p>
            </div>
        </div>

    </div>
</template>