<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { createWS } from '@/utils/ws'
import { api } from '@/api'

const props = defineProps(['id'])

const termElement = ref(null)
let term = null
let fitAddon = null
let socket = null

// 暴露给父组件发送命令的方法
const sendCommand = (command) => {
  if (socket) {
    socket.send(command + '\r\n')
  } else {
    console.warn('WebSocket未连接，无法发送命令')
  }
}

// 暴露
defineExpose({ sendCommand })

// 自适应大小
function resizeScreen() {
  try {
    fitAddon?.fit()
  } catch (e) {
    console.log('resizeScreenError', e.message)
  }
}

onMounted(async () => {
  // 初始化终端
  term = new Terminal({
    cursorBlink: true,
    allowUnicode: true,
    convertEol: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: {
      background: '#212121'
    }
  })

  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(termElement.value)
  fitAddon.fit()

  // 加载历史日志
  const data = await api.getServerLog(props.id)
  if (data.logs) {
    term.write(data.logs)
  }

  // 建立 WebSocket
  socket = createWS(
    props.id,
    (data) => {
      term.write(data)
    }
  )

  // 发送终端输入数据到服务器
  term.onData((data) => {
    socket.send(data)
  })

  // 监听窗口大小变化
  window.addEventListener('resize', resizeScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeScreen)
  socket?.close()
  term?.dispose()
})
</script>

<template>
  <div class="rounded-box shadow-sm mb-2" style="background-color: #212121;">
    <div ref="termElement" class="p-2 min-h-[400px]"></div>
  </div>
</template>