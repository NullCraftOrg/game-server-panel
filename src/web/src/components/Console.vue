<script setup>
import { ref, onMounted, onUnmounted, onBeforeMount } from 'vue'
import { useServerStore } from '@/stores/serverStore'
import { api } from '@/api'
import ServerInfoBar from '@/components/serverConsole/ServerInfoBar.vue'
import TerminalPane from '@/components/serverConsole/TerminalPane.vue'
import CommandInput from '@/components/serverConsole/CommandInput.vue'

const props = defineProps(['uuid'])
const serverStore = useServerStore()

const server = ref({})
const actionLoading = ref(false)  // 启动/停止按钮独立加载状态
let timer = null

// 获取服务器信息
async function getServerInfo() {
  server.value = await serverStore.fetchServerInfo(props.uuid)
}

// 启动
async function start() {
  if (actionLoading.value) return
  actionLoading.value = true
  try {
    await api.startServer(props.uuid)
    await getServerInfo()
  } catch (err) {
    console.error('启动失败', err)
  } finally {
    actionLoading.value = false
  }
}

// 停止
async function stop() {
  if (actionLoading.value) return
  actionLoading.value = true
  try {
    await api.stopServer(props.uuid)
    await getServerInfo()
  } catch (err) {
    console.error('停止失败', err)
  } finally {
    actionLoading.value = false
  }
}

// 发送命令（由 CommandInput 触发）
const terminalRef = ref(null)
const handleSendCommand = (cmd) => {
  terminalRef.value?.sendCommand(cmd)
  console.log(cmd);
}

onBeforeMount(() => {
  // 轮询更新服务器状态（保持原有每秒刷新）
  timer = setInterval(() => getServerInfo(), 1000)
})

onMounted(async () => {
  await getServerInfo()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <ServerInfoBar
    :server="server"
    :action-loading="actionLoading"
    @start="start"
    @stop="stop"
  />
  <TerminalPane ref="terminalRef" :uuid="props.uuid" />
  <CommandInput @send="handleSendCommand" />
</template>