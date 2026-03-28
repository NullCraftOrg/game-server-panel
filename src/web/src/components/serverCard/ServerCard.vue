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
</script>

<template>
    <div class="card bg-base-100 card-sm shadow-sm">
        <div class="card-body">
            <div class="card-title">
                <ServerStatusIndicator :is-running="server.isRunning" />
                <h2>{{ server.name }}</h2>
            </div>

            <p>这是一个服务器占位信息 :)</p>

            <div class="flex justify-between">
                <ServerActionButtons @edit="$emit('edit', server)" @delete="$emit('delete', server)" />
                <ServerControlButtons :server-id="server.id" :loading="loading" :is-running="server.isRunning" @start="$emit('start', server.id)"
                    @stop="$emit('stop', server.id)" @console="$emit('console', server.id)" />
            </div>
        </div>
    </div>
</template>