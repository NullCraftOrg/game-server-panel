<script setup>
defineProps(['pid', 'version', 'uptime', 'cpuUser', 'cpuSystem'])
</script>

<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="card-title">
                NodeJs信息
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div>
                    <div class="text-sm text-base-content/70">PID</div>
                    <div class="font-mono text-lg font-bold">{{ pid ?? '-'}}</div>
                </div>
                <div>
                    <div class="text-sm text-base-content/70">版本</div>
                    <div class="font-semibold">{{ version ?? '-'}}</div>
                </div>
                <div>
                    <div class="text-sm text-base-content/70">运行时长</div>
                    <div class="font-semibold">{{ uptime ?? '-'}}</div>
                </div>
                <div>
                    <div class="text-sm text-base-content/70">CPU 时间</div>
                    <div class="text-sm font-semibold">用户: {{ cpuUser ?? '-'}}<br> 系统: {{ cpuSystem ?? '-'}}</div>
                </div>
            </div>
        </div>
    </div>
</template>