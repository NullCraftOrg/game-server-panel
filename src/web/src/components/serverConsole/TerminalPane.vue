<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createWS } from '@/utils/ws'
import { api } from '@/api'
// xterm 终端相关
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';

const props = defineProps(['id'])

const termElement = ref(null)
let term = null
let fitAddon = null
let socket = null

// 暴露给父组件发送命令的方法
const sendCommand = (command) => {
  if (socket) {
    socket.send(command + '\r')
  } else {
    console.warn('WebSocket未连接，无法发送命令')
  }
}

// 暴露
defineExpose({ sendCommand })

// 跟随窗口大小变化自适应
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
    rows: 28,
    cursorBlink: true,
    allowUnicode: true,
    convertEol: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: {
      background: "#212121",
    },
  })

  // 加载插件
  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.loadAddon(new WebLinksAddon());
  term.loadAddon(new WebglAddon());

  // 打开终端
  term.open(termElement.value)
  // 自适应大小
  fitAddon.fit()

  // 2026-03-23 已不需要通过API加载，补发日志功能使用 WebsSocket 连接时发送。
  // 通过HTTP API加载历史日志
  // const data = await api.getServerLog(props.id)
  // if (data.logs) {
  //   console.log(data.logs, 'data.logs');
  //   term.write(data.logs)
  // }

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
  <div class="rounded-box shadow-sm mb-2 p-2" style="background-color: #212121;">
    <div ref="termElement"></div>
  </div>
</template>