<script setup>
defineProps(['title', 'left', 'right', 'percent', 'desc', 'percentColor'])
</script>

<template>
    <div class="stat bg-base-100 shadow">
        <div class="stat-figure">
            <div class="radial-progress" :class="percentColor" role="progressbar" style="--size: 3rem;"
                :style="{ '--value': Math.round(percent) }">{{ Math.round(percent) }}</div>
        </div>
        <div class="stat-title">{{ title ?? '-' }}</div>
        <div class="stat-value">{{ left ?? '-' }}<span class="text-2xl">/{{ right ?? '-' }}</span></div>
        <div class="stat-desc overflow-hidden flex items-center gap-1">
            <slot></slot>
            <p>{{ desc ?? '-' }}</p>
        </div>
    </div>
</template>