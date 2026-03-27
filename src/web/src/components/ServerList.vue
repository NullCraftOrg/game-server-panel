<script setup>
import { api } from '@/api'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/serverStore'

import DeleteServerDialog from './dialogs/DeleteServerDialog.vue'
import AddServerDialog from './dialogs/AddServerDialog.vue'

const router = useRouter()
const serverStore = useServerStore()

const actionLoading = ref(false) // 用于控制启动/停止按钮的加载状态

// 新建服务器
async function create(data) {
  await api.createServer({
    name: data.name,
    fileName: data.fileName,
    command: data.command,
    cwd: data.cwd || '.'
  })

  await serverStore.fetchServers()

  console.log('成功创建服务器。')
}

// 更新服务器
async function update(id, data) {
  await api.updateServer(id, {
    name: data.name,
    fileName: data.fileName,
    command: data.command,
    cwd: data.cwd
  })

  await serverStore.fetchServers()

  console.log('成功更新服务器。')
}


// 启动服务器
async function start(id) {
  if (actionLoading.value) return
  actionLoading.value = true
  try {
    await api.startServer(id)
    await serverStore.fetchServers()
  } catch (err) {
    console.error('启动失败', err)
  } finally {
    actionLoading.value = false
  }
}

// 停止服务器
async function stop(id) {
  if (actionLoading.value) return
  actionLoading.value = true
  try {
    await api.stopServer(id)
    await serverStore.fetchServers()
  } catch (err) {
    console.error('停止失败', err)
  } finally {
    actionLoading.value = false
  }
}

// 删除服务器
async function remove(id) {
  await api.deleteServer(id)
  await serverStore.fetchServers()
}

// 跳转控制台页面
function openConsole(id) {
  router.push(`/servers/${id}/console`)
}

// 新建/编辑服务器相关逻辑
const dialogVisible = ref(false)
const currentServer = ref(null) // 编辑模式下存放待编辑的服务器对象

// 打开新建对话框
const openCreateDialog = () => {
  currentServer.value = null
  dialogVisible.value = true
}

// 打开编辑对话框（传入服务器对象）
const openEditDialog = (server) => {
  currentServer.value = server
  dialogVisible.value = true
}

// 处理提交
const handleConfirm = (data) => {
  if (data.id) {
    // 编辑模式：调用更新接口
    update(data.id, data)
  } else {
    // 新建模式：调用创建接口
    create(data)
  }
}

// 删除服务器相关逻辑
const deleteDialogVisible = ref(false)
const selectedDeleteServer = ref(null)

const openDeleteDialog = (server) => {
  selectedDeleteServer.value = server
  deleteDialogVisible.value = true
}

const handleDeleteConfirm = async (serverId) => {
  await stop(serverId) // 为了防止运行的服务器被删除，先尝试停止它
  await remove(serverId) // 通过Id删除服务器
}

onMounted(() => {
  serverStore.initPolling()
})

onUnmounted(() => {
  serverStore.cleanup()
})
</script>

<template>
  <div class="flex justify-end gap-2 mb-3">
    <!-- 打开对话框的按钮 -->
    <button class="btn btn-primary" @click="openCreateDialog">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 12h14m-7-7v14" />
      </svg>
      新建服务器
    </button>
    <!-- 刷新服务器列表按钮 -->
    <button class="btn" @click="serverStore.fetchServers()">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M21 12a9 9 0 0 0-9-9a9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5m-5 4a9 9 0 0 0 9 9a9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </g>
      </svg>
      刷新服务器
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="card bg-base-100 card-sm shadow-sm" v-for="s in serverStore.servers" :key="s.id">
      <div class="card-body">

        <div class="card-title">
          <div class="inline-grid *:[grid-area:1/1]">
            <template v-if="s.isRunning">
              <div class="status status-success animate-ping"></div>
              <div class="status status-success"></div>
            </template>
            <template v-else>
              <div class="status status-error animate-ping"></div>
              <div class="status status-error"></div>
            </template>
          </div>
          <h2>
            {{ s.name }}
          </h2>
        </div>

        <p>这是一个服务器占位信息 :)</p>

        <div class="flex justify-between">
          <div class="card-actions">
            <!-- 删除按钮 -->
            <button class="btn btn-sm btn-square btn-dash btn-error" @click="openDeleteDialog(s)">
              <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M18 6L6 18M6 6l12 12" />
                </g>
              </svg>
            </button>

            <!-- 编辑按钮 -->
            <button class="btn btn-sm btn-square btn-dash" @click="openEditDialog(s)">
              <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path
                    d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                </g>
              </svg>
            </button>
          </div>

          <div class="card-actions">
            <!-- 启动按钮 -->
            <button class="btn btn-sm btn-square btn-soft btn-success" @click="start(s.id)">
              <span v-show="actionLoading" class="size-[1.2em] loading loading-spinner"></span>
              <svg v-show="!actionLoading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24"
                height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              </svg>
            </button>

            <!-- 停止按钮 -->
            <button class="btn btn-sm btn-square btn-soft btn-error" @click="stop(s.id)">
              <span v-show="actionLoading" class="size-[1.2em] loading loading-spinner"></span>
              <svg v-show="!actionLoading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24"
                height="24" viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="3" fill="none" stroke="currentColor" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="2" rx="2" />
              </svg>
            </button>

            <!-- 控制台按钮 -->
            <button class="btn btn-sm btn-square" @click="openConsole(s.id)">
              <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="m7 11l2-2l-2-2m4 6h4" />
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                </g>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- 对话框组件：注意 :selected-server 是驼峰转短横线，且使用 v-model:visible -->
  <DeleteServerDialog v-model:visible="deleteDialogVisible" :selected-server="selectedDeleteServer"
    @confirm="handleDeleteConfirm" />

  <AddServerDialog v-model:visible="dialogVisible" :server="currentServer" @confirm="handleConfirm" />
</template>