<script setup>
defineProps(['rss', 'heapTotal', 'heapUsed', 'heapPercent', 'external', 'arrayBuffers', 'percentColor'])
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
                <!-- <a class="btn btn-xs" :href="`http://${props.ip}:${props.port}`" target="_blank"><svg
                        class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <path d="m10 16l4-4l-4-4m-7 4h11"></path>
                            <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                        </g>
                    </svg>
                    访问后端</a> -->
            </div>


            <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span>常驻集大小 (RSS)</span><span class="font-mono">{{ rss ?? '-'
                }}</span></div>
                <div class="flex justify-between"><span>堆总大小</span><span class="font-mono">{{ heapTotal ?? '-' }}</span>
                </div>
                <div class="flex justify-between"><span>堆已使用</span><span class="font-mono">{{ heapUsed ?? '-' }}</span>
                </div>
            </div>

            <div class="divider my-0"></div>

            <div class="flex justify-between text-xs"><span>堆内存使用率</span><span>{{ heapPercent ?? '-' }}%</span>
            </div>
            <progress class="progress w-full h-2" :class="`text-${percentColor}`" max="100"
                :value="heapPercent"></progress>

            <div class="flex justify-between">
                <span class="text-xs">外部内存: <span class="font-mono font-bold">{{ external ?? '-'
                }}</span></span>
                <span class="text-xs">ArrayBuffers: <span class="font-mono font-bold">{{
                    arrayBuffers ?? '-' }}</span></span>
            </div>
        </div>
    </div>
</template>