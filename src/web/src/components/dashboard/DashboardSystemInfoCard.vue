<script setup>
defineProps(['hostname', 'uptime', 'os', 'cpuModel', 'cpuArch'])
</script>

<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="card-title">
                系统信息
            </div>

            <div class="space-y-2">
                <div class="flex justify-between"><span class="text-base-content/70">主机名</span><span
                        class="font-mono font-semibold">{{ hostname ?? '-' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/70">运行时长</span><span
                        class="font-semibold">{{ uptime ?? '-' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/70">操作系统</span><span>{{ os ?? '-'
                        }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/70">CPU型号</span><span>{{ cpuModel ?? '-'
                        }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/70">CPU架构</span><span>{{ cpuArch ?? '-'
                        }}</span></div>
            </div>
        </div>
    </div>
</template>