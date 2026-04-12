<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, reactive, onBeforeMount } from 'vue'
import type { ServerType } from '@/types/ServerType'
import { useServerStore } from '@/stores/ServerStore'
import MainTitle from '@/components/MainTitle.vue'
import ServerCard from '@/components/ServerList/ServerCard.vue'
import EditServerDialog from '@/components/Dialog/EditServerDialog.vue'
import ServerListHeader from '@/components/ServerList/ServerListHeader.vue'
import ConfirmDialog from '@/components/Dialog/ConfirmDialog.vue'

const serverStore = useServerStore()
serverStore.fetchServerData()

const allServers = computed(() => serverStore.ServerData)
const runnningServers = computed(() => serverStore.ServerData?.filter(item => item.isRunning === true))
const stoppedServers = computed(() => serverStore.ServerData?.filter(item => item.isRunning === false))
const fileNotExistServers = computed(() => serverStore.ServerData?.filter(item => item.fileExist === false))

// 对话框相关
const dialogVisible = ref(false)
const currentServer = ref<ServerType | null>(null)

const openCreateDialog = () => {
    currentServer.value = null
    dialogVisible.value = true
}

const openEditDialog = (server: ServerType) => {
    currentServer.value = server
    dialogVisible.value = true
}

const handleConfirm = (data: ServerType | any) => {
    if (data.uuid) {
        serverStore.updateServerByUUID(data.uuid, data)
        console.log(data)
    } else {
        serverStore.createServer(data)
    }
}

const deleteDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)
const selectedServer = ref<ServerType | null>(null)
const openDeleteDialog = (key: ServerType) => {
    selectedServer.value = key
    // 调用对话框组件的 open 方法，传入 key
    if (deleteDialogRef.value) {
        deleteDialogRef.value.open(key.uuid)
    }
    console.log('准备删除服务器，uuid:', key.uuid)
}

const handleDeleteConfirm = async (key: string) => {
    console.log('确认删除服务器，uuid:', key)
    await serverStore.deleteServerByUUID(key)
}

// 重启服务器确认对话框引用
const restartServerDialogRef = ref()
function restartServer(key: ServerType) {
    // 如果服务器正在运行，弹出确认对话框；如果服务器未运行，直接重启(后端设计如果未运行则启动)
    if (key.isRunning) {
        if (restartServerDialogRef.value) {
            restartServerDialogRef.value.open(key.uuid)
        }
    } else {
        handleRestartConfirm(key.uuid)
    }
}
const handleRestartConfirm = async (key: string) => {
    await serverStore.restartServer(key)
}

onMounted(() => {
    serverStore.startPolling()
});

onUnmounted(() => {
    serverStore.stopPolling()
});
</script>

<template>
    <MainTitle>
        <div class="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                    <path d="M6 6h.01M6 18h.01" />
                </g>
            </svg>
            <h3 class="text-xl font-bold">服务器列表</h3>
        </div>
    </MainTitle>

    <ServerListHeader @create="openCreateDialog" @refresh="serverStore.fetchServerData"></ServerListHeader>
    
    <div class="tabs tabs-box border-0 p-0 shadow-none">
        <input type="radio" name="tabs_servers" class="tab" :aria-label="`全部 (${allServers?.length})`" checked="true" />
        <div class="tab-content mt-3 border-0">
            <!-- 全部服务器卡片列表 -->
            <div class="tab-content grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <ServerCard v-for="server in allServers" :key="server.uuid" :server="server" @edit="openEditDialog"
                    @delete="openDeleteDialog(server)" :loading="serverStore.isLoading(server.uuid)"
                    @start="serverStore.startServer(server.uuid)" @stop="serverStore.stopServer(server.uuid)"
                    @restart="restartServer(server)" @console="serverStore.openConsole(server.uuid)" />
            </div>
        </div>

        <input type="radio" name="tabs_servers" class="tab" :aria-label="`正在运行 (${runnningServers?.length})`" />
        <div class="tab-content mt-3 border-0">
            <!-- 正在运行服务器卡片列表 -->
            <div class="tab-content grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <ServerCard v-for="server in runnningServers" :key="server.uuid" :server="server" @edit="openEditDialog"
                    @delete="openDeleteDialog(server)" :loading="serverStore.isLoading(server.uuid)"
                    @start="serverStore.startServer(server.uuid)" @stop="serverStore.stopServer(server.uuid)"
                    @restart="restartServer(server)" @console="serverStore.openConsole(server.uuid)" />
            </div>
        </div>

        <input type="radio" name="tabs_servers" class="tab" :aria-label="`未运行 (${stoppedServers?.length})`" />
        <div class="tab-content mt-3 border-0">
            <!-- 未运行服务器卡片列表 -->
            <div class="tab-content grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <ServerCard v-for="server in stoppedServers" :key="server.uuid" :server="server" @edit="openEditDialog"
                    @delete="openDeleteDialog(server)" :loading="serverStore.isLoading(server.uuid)"
                    @start="serverStore.startServer(server.uuid)" @stop="serverStore.stopServer(server.uuid)"
                    @restart="restartServer(server)" @console="serverStore.openConsole(server.uuid)" />
            </div>
        </div>

        <input type="radio" name="tabs_servers" class="tab" :aria-label="`无法运行 (${fileNotExistServers?.length})`" />
        <div class="tab-content mt-3 border-0">
            <!-- 无法运行服务器卡片列表 -->
            <div class="tab-content grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <ServerCard v-for="server in fileNotExistServers" :key="server.uuid" :server="server"
                    @edit="openEditDialog" @delete="openDeleteDialog(server)"
                    :loading="serverStore.isLoading(server.uuid)" @start="serverStore.startServer(server.uuid)"
                    @stop="serverStore.stopServer(server.uuid)" @restart="restartServer(server)"
                    @console="serverStore.openConsole(server.uuid)" />
            </div>
        </div>
    </div>

    <ConfirmDialog ref="deleteDialogRef" title="确定要删除这个服务器配置吗?" button-confirm-text="我知道自己在做什么!"
        button-confirm-color="btn-error" @confirm="handleDeleteConfirm">
        <template v-slot:content>
            <p class="py-4">
                服务器 <strong class="text-error">{{ selectedServer?.name }}</strong> 将会永久消失！(真的很久！)
            </p>
        </template>
    </ConfirmDialog>

    <ConfirmDialog ref="restartServerDialogRef" title="重启服务器" @confirm="handleRestartConfirm">
        <template v-slot:content>
            <div class="py-4">
                <p>
                    确定要重启 <strong class="text-info">{{ selectedServer?.name }}</strong> 服务器吗？
                </p>
                <p class="text-base-content/70">重启服务器可能会导致未保存的数据丢失而回档，当前连接的玩家可能会被断开。</p>
            </div>
        </template>
    </ConfirmDialog>

    <EditServerDialog v-model:visible="dialogVisible" :server="currentServer" @confirm="handleConfirm">
    </EditServerDialog>
</template>