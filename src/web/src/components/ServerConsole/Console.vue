<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TerminalPane from '@/components/ServerConsole/TerminalPane.vue'
import ServerInfoBar from '@/components/ServerConsole/ServerInfoBar.vue'
import CommandInput from '@/components/ServerConsole/CommandInput.vue'
import Countdown from '@/components/Countdown.vue'
import type { ServerType } from '@/types/ServerType';
import { useRoute } from 'vue-router'

const route = useRoute()
const uuid: string = route.params.uuid as string

import { useServerStore } from '@/stores/ServerStore'
import ConfirmDialog from '../Dialog/ConfirmDialog.vue';
const serverStore = useServerStore()

const retryCount = ref(0)
const server = ref<ServerType | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null
const errorMessage = ref<string | null>(null)

// 刷新当前页面的服务器信息
async function refreshServerInfo() {
  const result = await serverStore.getServerByUUID(uuid)
  retryCount.value++
  if (result && 'ok' in result && result.ok === false) {
    errorMessage.value = result.message || '获取服务器信息失败'
  } else if (result) {
    // 成功获取到 ServerType 数据
    server.value = result as ServerType
  } else {
    // 返回了 undefined（理论上不会发生，但兜底）
    server.value = null
  }
}

function clearRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

refreshServerInfo()

// 发送命令(传递给CommandInput组件)
const terminalRef = ref()
const handleSendCommand = (cmd: string) => {
  terminalRef.value?.sendCommand(cmd)
  console.log(cmd)
}

// 重启服务器确认对话框引用
const restartServerDialogRef = ref()
function restartServer(uuid: string) {
  // 如果服务器正在运行，弹出确认对话框；如果服务器未运行，直接重启(后端设计如果未运行则启动)
  if (server.value?.isRunning) {
    if (restartServerDialogRef.value) {
      restartServerDialogRef.value.open(uuid)
    }
  } else {
    handleRestartConfirm(uuid)
  }
}
const handleRestartConfirm = async (key: string) => {
  await serverStore.restartServer(key)
}

onMounted(() => {
  refreshTimer = setInterval(refreshServerInfo, 1000)
})

onUnmounted(() => {
  clearRefreshTimer()
})
</script>

<template>
  <template v-if="server">
    <ServerInfoBar :server="server" :action-loading="serverStore.isLoading(uuid)" @start="serverStore.startServer(uuid)"
      @stop="serverStore.stopServer(uuid)" @restart="restartServer(uuid)" />
    <TerminalPane ref="terminalRef" :uuid="uuid" :use-pty="server?.usePty" :is-running="server?.isRunning" />
    <CommandInput @send="handleSendCommand" />
    <ConfirmDialog ref="restartServerDialogRef" title="重启服务器" @confirm="handleRestartConfirm">
      <template v-slot:content>
        <div class="py-4">
          <p>
            确定要重启 <strong class="text-info">{{ server?.name }}</strong> 服务器吗？
          </p>
          <p class="text-base-content/70">重启服务器可能会导致未保存的数据丢失而回档，当前连接的玩家可能会被断开。</p>
        </div>
      </template>
    </ConfirmDialog>
  </template>
  <template v-else-if="errorMessage">
    <div class="text-center">
      <p class="text-2xl">获取服务器信息失败</p>
      <p class="text-md text-red-500">{{ errorMessage }}</p>
      <div class="text-xl">
        已重试
        <Countdown :count="retryCount" />
        次
      </div>
    </div>
  </template>
</template>