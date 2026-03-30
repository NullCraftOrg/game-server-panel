<script setup>
defineProps(['rss', 'heapTotal', 'heapUsed', 'heapPercent', 'external', 'arrayBuffers', 'percentColor'])
</script>

<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="card-title">
                NodeJs信息
            </div>

            <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span>常驻集大小 (RSS)</span><span class="font-mono">{{ rss ?? '-'
                }}</span></div>
                <div class="flex justify-between"><span>堆总大小</span><span class="font-mono">{{ heapTotal ?? '-' }}</span>
                </div>
                <div class="flex justify-between"><span>堆已使用</span><span class="font-mono">{{ heapUsed ?? '-' }}</span>
                </div>
                <div class="mt-1">
                    <div class="flex justify-between text-xs"><span>堆内存使用率</span><span>{{ heapPercent ?? '-' }}%</span>
                    </div>
                    <progress class="progress w-full h-2" :class="`text-${percentColor}`"  max="100" :value="heapPercent"></progress>
                </div>
                <div class="grid grid-cols-2 gap-1 pt-1 text-xs">
                    <div><span class="text-base-content/70">外部内存:</span><span class="ml-1 font-mono">{{ external ?? '-'
                    }}</span></div>
                    <div><span class="text-base-content/70">ArrayBuffers:</span><span class="ml-1 font-mono">{{
                        arrayBuffers ?? '-' }}</span></div>
                </div>
            </div>
        </div>
    </div>
</template>