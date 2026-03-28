<script setup>
import { api } from '@/api'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/serverStore'

import DeleteServerDialog from '@/components/dialogs/DeleteServerDialog.vue'
import AddServerDialog from '@/components/dialogs/AddServerDialog.vue'
import ServerListHeader from '@/components/ServerListHeader.vue'
import ServerCard from '@/components/serverCard/ServerCard.vue'

const router = useRouter()
const serverStore = useServerStore()

// 每个服务器独立的加载状态
const actionLoadingMap = reactive({})

function isLoading(id) {
    return !!actionLoadingMap[id]
}

function setLoading(id, loading) {
    if (loading) {
        actionLoadingMap[id] = true
    } else {
        delete actionLoadingMap[id]
    }
}

async function create(data) {
    await api.createServer({
        name: data.name,
        fileName: data.fileName,
        command: data.command,
        cwd: data.cwd,
        forceUtf8Mode: data.forceUtf8Mode
    })
    await serverStore.fetchServers()
    console.log('成功创建服务器。')
}

async function update(id, data) {
    await api.updateServer(id, {
        name: data.name,
        fileName: data.fileName,
        command: data.command,
        cwd: data.cwd,
        forceUtf8Mode: data.forceUtf8Mode
    })
    await serverStore.fetchServers()
    console.log('成功更新服务器。')
}

async function start(id) {
    setLoading(id, true)
    try {
        await api.startServer(id)
        await serverStore.fetchServers()
    } catch (err) {
        console.error('启动失败', err)
    } finally {
        setLoading(id, false)
    }
}

async function stop(id) {
    setLoading(id, true)
    try {
        await api.stopServer(id)
        await serverStore.fetchServers()
    } catch (err) {
        console.error('停止失败', err)
    } finally {
        setLoading(id, false)
    }
}

async function remove(id) {
    await api.deleteServer(id)
    await serverStore.fetchServers()
}

function openConsole(id) {
    router.push(`/servers/${id}/console`)
}

// 对话框相关
const dialogVisible = ref(false)
const currentServer = ref(null)

const openCreateDialog = () => {
    currentServer.value = null
    dialogVisible.value = true
}

const openEditDialog = (server) => {
    currentServer.value = server
    dialogVisible.value = true
}

const handleConfirm = (data) => {
    if (data.id) {
        update(data.id, data)
        console.log(data, 'confda');
    } else {
        create(data)
    }
}

const deleteDialogVisible = ref(false)
const selectedDeleteServer = ref(null)

const openDeleteDialog = (server) => {
    selectedDeleteServer.value = server
    deleteDialogVisible.value = true
}

const handleDeleteConfirm = async (serverId) => {
    await stop(serverId)  // 先停止，防止删除运行中的服务器
    await remove(serverId)
}

// ==================== 生命周期 ====================
onMounted(() => {
    serverStore.initPolling()
})

onUnmounted(() => {
    serverStore.cleanup()
})
</script>

<template>
    <!-- 头部操作栏 -->
    <ServerListHeader @create="openCreateDialog" @refresh="serverStore.fetchServers" />

    <!-- 服务器卡片列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ServerCard v-for="server in serverStore.servers" :key="server.id" :server="server"
            :loading="isLoading(server.id)" @start="start" @stop="stop" @edit="openEditDialog"
            @delete="openDeleteDialog" @console="openConsole" />
    </div>

    <!-- 对话框 -->
    <DeleteServerDialog v-model:visible="deleteDialogVisible" :selected-server="selectedDeleteServer"
        @confirm="handleDeleteConfirm" />

    <AddServerDialog v-model:visible="dialogVisible" :server="currentServer" @confirm="handleConfirm" />
</template>