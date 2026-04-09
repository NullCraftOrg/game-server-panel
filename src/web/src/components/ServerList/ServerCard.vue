<script setup lang="ts">
import ServerStatusIndicator from '@/components/ServerList/ServerStatusIndicator.vue'
import ServerActionButtons from '@/components/ServerList/ServerActionButtons.vue'
import ServerControlButtons from '@/components/ServerList/ServerControlButtons.vue'
import type { ServerType } from '@/types/ServerType'

interface Props {
    server: ServerType,
    loading: boolean
}
const props = defineProps<Props>()

const formattedTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
}

defineEmits(['start', 'stop', 'restart', 'edit', 'delete', 'console'])
</script>

<template>
    <div class="card bg-base-100 card-sm shadow hover:shadow-lg transition-shadow duration-300">
        <div class="card-body">
            <div class="card-title">
                <ServerStatusIndicator :is-running="server.isRunning" :file-exist="server.fileExist" />
                <h2>{{ server.name }}</h2>
            </div>

            <div class="text-xs">
                <p>{{ server.lastStartTime ? '最后启动时间: ' + formattedTime(server.lastStartTime) : '' }}</p>
                <p>{{ server.lastStopTime ? '最后停止时间: ' + formattedTime(server.lastStopTime) : '' }}</p>
            </div>
        </div>

        <div class="flex justify-between p-4 pt-0">
            <ServerActionButtons @edit="$emit('edit', server)" @delete="$emit('delete', server)" />
            <ServerControlButtons :server-uuid="server.uuid" :loading="loading" :is-running="server.isRunning ?? false"
                @start="$emit('start', server.uuid)" @stop="$emit('stop', server.uuid)"
                @restart="$emit('restart', server.uuid)" @console="$emit('console', server.uuid)" />
        </div>
    </div>
</template>