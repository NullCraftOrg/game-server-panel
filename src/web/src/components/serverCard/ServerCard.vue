<script setup>
import ServerStatusIndicator from '@/components/serverCard/ServerStatusIndicator.vue'
import ServerActionButtons from '@/components/serverCard/ServerActionButtons.vue'
import ServerControlButtons from '@/components/serverCard/ServerControlButtons.vue'

defineProps({
    server: {
        type: Object,
        required: true
    },
    loading: Boolean
})

defineEmits(['start', 'stop', 'edit', 'delete', 'console'])

// 计算属性返回格式化字符串
function formattedTime(time) {
    if (!time) return
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
</script>

<template>
    <div class="card bg-base-100 card-sm shadow">
        <div class="card-body">
            <div class="card-title">
                <ServerStatusIndicator :is-running="server.isRunning" :file-exist="server.fileExist"/>
                <h2>{{ server.name }}</h2>
            </div>

            <div class="text-xs">
                <p>{{ server.lastStartTime ? '最后启动时间: ' + formattedTime(server.lastStartTime) : '' }}</p>
                <p>{{ server.lastStopTime ? '最后停止时间: ' + formattedTime(server.lastStopTime) : '' }}</p>
            </div>
        </div>

        <div class="flex justify-between p-4 pt-0">
            <ServerActionButtons @edit="$emit('edit', server)" @delete="$emit('delete', server)" />
            <ServerControlButtons :server-id="server.id" :loading="loading" :is-running="server.isRunning"
                @start="$emit('start', server.id)" @stop="$emit('stop', server.id)"
                @console="$emit('console', server.id)" />
        </div>
    </div>
</template>