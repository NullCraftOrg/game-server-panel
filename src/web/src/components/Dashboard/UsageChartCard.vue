<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    title: string
    desc: string
    left: number | string
    right: number | string
    percent: number
    percentSuffix?: string
    percentColor: string

    lineColor?: string
    areaColorTop?: string
    areaColorBottom?: string
    strokeWidth?: number
    data?: number[]
}

const props = withDefaults(defineProps<Props>(), {
    title: '-',
    desc: '-',
    left: '-',
    right: '-',
    percent: 0,
    percentSuffix: '%',
    percentColor: 'text-neutral',

    lineColor: 'rgb(0,200,150)',
    areaColorTop: 'rgba(0,200,150,0.4)',
    areaColorBottom: 'rgba(0,200,150,0.05)',
    strokeWidth: 1.5,
    data: () => []
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
    <div class="relative rounded-box bg-base-100 shadow tooltip tooltip-bottom [--tt-bg:var(--color-base-300)]">
        <slot name="tooltip"></slot>

        <svg class="absolute inset-0 w-full h-full pointer-events-none rounded-box" preserveAspectRatio="none"
            viewBox="0 0 100 100">
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

        <div class="stat relative z-10">
            <!-- 圆形进度 -->
            <div class="stat-figure">
                <div class="glass radial-progress" :class="percentColor" role="progressbar" style="--size: 3.5rem;"
                    :style="{ '--value': Math.round(percent) }">
                    <span class="text-sm">{{ Math.round(percent) }}<span class="text-xs">{{ percentSuffix }}</span></span>
                </div>
            </div>
            <div class="stat-title">{{ title }}</div>
            <div class="stat-value">{{ left }}<span class="text-2xl">/{{ right }}</span></div>
            <div class="stat-desc overflow-hidden flex items-center gap-1">
                <slot name="icon"></slot>
                <p>{{ desc }}</p>
            </div>
        </div>
    </div>

</template>