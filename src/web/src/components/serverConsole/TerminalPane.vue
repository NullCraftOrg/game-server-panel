<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createWS, type WSType } from '@/utils/ws'
// xterm 终端相关
import { defalutTheme, atomDarkTheme } from '@/utils/xtermTheme'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { WebglAddon } from '@xterm/addon-webgl'
import { Unicode11Addon } from '@xterm/addon-unicode11'

const props = defineProps<{
  uuid: string,
  usePty: boolean,
  isRunning?: boolean
}>()

const termElement: { value: HTMLElement | null } = ref(null)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: WSType

// 滚动终端底部按钮显示状态
const showTermScrollButton = ref(true)
// 点击按钮滚动到底部
const termScrollToBottom = () => {
  term?.scrollToBottom()
}

// 发送命令
// (20260411: 更改为Json传输，增加type区分输入和调整终端大小)
// input = 输入命令，resize = 调整终端大小
const sendCommand = (command: string) => {
  if (socket) {
    socket.send(JSON.stringify({ type: 'input', message: command + '\r' }))
  } else {
    console.warn('WebSocket未连接，无法发送命令')
  }
}

// 跟随窗口大小变化自适应
function resizeScreen() {
  try {
    fitAddon?.fit()
    // 更新node-pty终端尺寸会有问题，暂时固定大小
    // 问题1多页面下同一服务器不同尺寸问题问题
    // 2调整大小可能导致更多的ANSI字符渲染问题。
    // const { cols, rows } = term as Terminal
    // socket.send(JSON.stringify({ type: 'resize', cols, rows }))
  } catch (e: any) {
    console.log('resizeScreenError', e.message)
  }
}

onMounted(async () => {
  // 初始化终端
  term = new Terminal({
    allowProposedApi: true, // 启用实验API(Unicode11Addon需要)
    // 暂时使用固定大小后期考虑更好的方案
    rows: 32,
    cols: 1000,
    cursorBlink: true,
    convertEol: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: defalutTheme,
    // 透明背景色：目前还没有使用场景。
    // allowTransparency: true,
    // theme: {
    //   background: "transparent",
    // },
  })

  // 加载插件
  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.loadAddon(new WebLinksAddon());
  term.loadAddon(new WebglAddon());
  term.loadAddon(new Unicode11Addon());

  // 启用 Unicode 11 支持
  term.unicode.activeVersion = '11';

  // 打开终端
  term.open(termElement.value as HTMLElement)
  // 自适应大小
  fitAddon.fit()

  // 建立 WebSocket
  socket = createWS(
    props.uuid,
    (data) => {
      term?.write(data)
    }
  )

  // 监听滚动事件，控制滚动到底部按钮显示
  term.onScroll(() => {
    // buffer.active.viewportY: 当前滚动到的行位置
    // buffer.active.baseY: 终端内容的总行数（减去视口高度）
    // 如果 viewportY < baseY，说明滚动条不在最下方
    if (term) {
      showTermScrollButton.value = term.buffer.active.viewportY >= term.buffer.active.baseY;
    }
  });


  // 发送终端输入数据到服务器
  let inputBuffer = ''
  term.onData((data) => {
    // 当服务器未运行时，禁止输入内容
    if (!props.isRunning) return

    // 如果使用了仿真模拟则直接发送输入数据，否则模拟传统终端行为回车后整体发送
    if (props.usePty) {
      socket?.send(JSON.stringify({ type: 'input', message: data }))
    }
    else {
      if (data === '\r') {
        socket.send(JSON.stringify({ type: 'input', message: inputBuffer + '\n' }))
        inputBuffer = ''
        term?.write('\r\n')
      } else if (data === '\u007f') {
        // 退格模拟
        inputBuffer = inputBuffer.slice(0, -1)
        term?.write('\b \b')
      } else {
        inputBuffer += data
        term?.write(data)
      }
    }
  })

  // 监听窗口大小变化
  window.addEventListener('resize', resizeScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeScreen)
  socket?.close()
  term?.dispose()
})

// 暴露给父组件发送命令的方法
defineExpose({ sendCommand })
</script>

<template>

  <div class="relative rounded-md shadow my-2 p-2" style="background-color: #212121;">
    <div ref="termElement"></div>

    <Transition name="fade">
      <button v-if="!showTermScrollButton" @click="termScrollToBottom"
        class="absolute bottom-8 right-8 z-10 btn btn-square btn-sm shadow hover:scale-108 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
          class="size-4">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 17V3m-6 8l6 6l6-6m1 10H5" />
        </svg>
      </button>
    </Transition>
  </div>

</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>