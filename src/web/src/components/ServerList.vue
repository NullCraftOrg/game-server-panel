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

function isLoading(uuid) {
    return !!actionLoadingMap[uuid]
}

function setLoading(uuid, loading) {
    if (loading) {
        actionLoadingMap[uuid] = true
    } else {
        delete actionLoadingMap[uuid]
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

async function update(uuid, data) {
    await api.updateServer(uuid, {
        name: data.name,
        fileName: data.fileName,
        command: data.command,
        cwd: data.cwd,
        forceUtf8Mode: data.forceUtf8Mode
    })
    await serverStore.fetchServers()
    console.log('成功更新服务器。')
}

async function start(uuid) {
    setLoading(uuid, true)
    try {
        await api.startServer(uuid)
        await serverStore.fetchServers()
    } catch (err) {
        console.error('启动失败', err)
    } finally {
        setLoading(uuid, false)
    }
}

async function stop(uuid) {
    setLoading(uuid, true)
    try {
        await api.stopServer(uuid)
        await serverStore.fetchServers()
    } catch (err) {
        console.error('停止失败', err)
    } finally {
        setLoading(uuid, false)
    }
}

async function restart(uuid) {
    setLoading(uuid, true)
    try {
        await api.restartServer(uuid)
        await serverStore.fetchServers()
    } catch (err) {
        console.error('重启失败', err)
    } finally {
        setLoading(uuid, false)
    }
}

async function remove(uuid) {
    await api.deleteServer(uuid)
    await serverStore.fetchServers()
}

function openConsole(uuid) {
    router.push(`/servers/${uuid}/console`)
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
    if (data.uuid) {
        update(data.uuid, data)
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

    <div class="tabs tabs-box border-0 p-0 shadow-none">
        <input type="radio" name="tabs_servers" class="tab" :aria-label="`全部 (${serverStore.servers.length})`"
            checked="checked" />
        <div class="tab-content mt-3 border-0">
            <!-- 全部服务器卡片列表 -->
            <div class="tab-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServerCard v-for="server in serverStore.servers" :key="server.uuid" :server="server"
                    :loading="isLoading(server.uuid)" @edit="openEditDialog" @delete="openDeleteDialog" @start="start"
                    @stop="stop" @restart="restart" @console="openConsole" />
            </div>
        </div>

        <input type="radio" name="tabs_servers" class="tab"
            :aria-label="`正在运行 (${serverStore.servers.filter(item => item.isRunning === true).length})`" />
        <div class="tab-content mt-3 border-0">
            <!-- 正在运行服务器卡片列表 -->
            <div class="tab-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServerCard v-for="server in serverStore.servers.filter(item => item.isRunning === true)"
                    :key="server.uuid" :server="server" :loading="isLoading(server.uuid)" @start="start" @stop="stop"
                    @edit="openEditDialog" @delete="openDeleteDialog" @console="openConsole" />
            </div>
        </div>

        <input type="radio" name="tabs_servers" class="tab"
            :aria-label="`未运行 (${serverStore.servers.filter(item => item.isRunning === false).length})`" />
        <div class="tab-content mt-3 border-0">
            <!-- 未运行服务器卡片列表 -->
            <div class="tab-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServerCard v-for="server in serverStore.servers.filter(item => item.isRunning === false)"
                    :key="server.uuid" :server="server" :loading="isLoading(server.uuid)" @start="start" @stop="stop"
                    @edit="openEditDialog" @delete="openDeleteDialog" @console="openConsole" />
            </div>
        </div>

        <input type="radio" name="tabs_servers" class="tab"
            :aria-label="`无法运行 (${serverStore.servers.filter(item => item.fileExist === false).length})`" />
        <div class="tab-content mt-3 border-0">
            <!-- 无法运行服务器卡片列表 -->
            <div class="tab-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServerCard v-for="server in serverStore.servers.filter(item => item.fileExist === false)"
                    :key="server.uuid" :server="server" :loading="isLoading(server.uuid)" @start="start" @stop="stop"
                    @edit="openEditDialog" @delete="openDeleteDialog" @console="openConsole" />
            </div>
        </div>
    </div>

    <!-- 对话框 -->
    <DeleteServerDialog v-model:visible="deleteDialogVisible" :selected-server="selectedDeleteServer"
        @confirm="handleDeleteConfirm" />

    <AddServerDialog v-model:visible="dialogVisible" :server="currentServer" @confirm="handleConfirm" />
</template>