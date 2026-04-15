<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
// 终端容器尺寸监听
let resizeObserver: ResizeObserver

// 滚动终端底部按钮显示状态
const showTermScrollButton = ref(true)
// 点击按钮滚动到底部
const termScrollToBottom = () => {
  term?.scrollToBottom()
}

/** 发送命令，对外公开 */
const sendCommand = (command: string) => {
  if (socket) {
    socket.sendJSON({ type: 'input', message: command + '\r' })
  } else {
    console.warn('WebSocket未连接，无法发送命令')
  }
}

/** 获取终端尺寸，对外公开 */
const getTerminalSize = () => {
  if (!term) return { cols: 80, rows: 24 }
  console.log('获取终端尺寸:', term.cols, term.rows)
  return { cols: term.cols, rows: term.rows }
}

/** 附属函数：防抖 */
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
) {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

// 防抖更新尺寸
const debouncedFit = debounce(() => {
  if (term && fitAddon) {
    fitAddon.fit()
  }
}, 150)

onMounted(async () => {
  // 初始化终端
  term = new Terminal({
    allowProposedApi: true, // 启用实验API(Unicode11Addon需要)
    scrollback: 1000,
    cursorBlink: true,
    convertEol: !props.usePty, // 非仿终端需要开启转换
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: defalutTheme,
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

  // 初始化尺寸
  fitAddon.fit()

  // 建立 WebSocket
  socket = createWS(props.uuid,)

  // 打开时发送初始化命令，用于请求历史日志与设置伪终端大小
  socket.onopen = () => {
    const { cols, rows } = getTerminalSize()
    socket?.sendJSON({
      type: 'init',
      cols: cols,
      rows: rows,
    })
    console.info('WebSocket初始化，发送初始尺寸:', cols, rows, '接收历史日志')
  }

  // 将内容加入到终端
  socket.onmessage = (message) => {
    term?.write(message.data)
  }

  socket.onclose = () => {
    console.log('Websocket 连接关闭')
  }

  socket.onerror = (err) => {
    console.error('Websocket 连接错误', err)
  }

  term.onResize(({ cols, rows }) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'resize', cols, rows }))
      console.info('发送变动尺寸:', cols, rows)
    }
  })

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
      socket?.sendJSON({ type: 'input', message: data })
    }
    else {
      if (data === '\r') {
        socket.sendJSON({ type: 'input', message: inputBuffer + '\n' })
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

  // ResizeObserver 监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    debouncedFit()
  })
  if (termElement.value) {
    resizeObserver.observe(termElement.value)
  }

})

onUnmounted(() => {
  resizeObserver?.disconnect()
  socket?.close()
  term?.dispose()
})

// 暴露给父组件发送命令的方法
defineExpose({ sendCommand, getTerminalSize })
// defineExpose({ sendCommand })
</script>

<template>

  <div class="relative rounded-md shadow my-2 p-2" style="background-color: #212121">
    <div class="overflow-hidden" ref="termElement"></div>

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