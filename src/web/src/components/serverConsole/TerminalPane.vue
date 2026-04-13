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
let resizeObserver: ResizeObserver

// 滚动终端底部按钮显示状态
const showTermScrollButton = ref(true)
// 点击按钮滚动到底部
const termScrollToBottom = () => {
  term?.scrollToBottom()
}

/** 获取终端尺寸 */
function getTerminalSize(): { cols: number; rows: number } {
  fitAddon?.fit()
  if (term != null) {
    const { cols, rows } = term
    return { cols, rows }
  }
  return { cols: 80, rows: 24 } // 默认值
}

// 发送命令
// (20260411: 更改为Json传输，增加type区分输入和调整终端大小)
// input = 输入命令，resize = 调整终端大小
const sendCommand = (command: string) => {
  if (socket) {
    socket.sendJSON({ type: 'input', message: command + '\r' })
  } else {
    console.warn('WebSocket未连接，无法发送命令')
  }
}

// 防抖函数，短时间内多次调用只执行最后一次
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

// 跟随窗口大小变化自适应
function resizeScreen() {
  if (!term || !fitAddon || !socket) return
  if (socket.readyState() !== WebSocket.OPEN) return

  fitAddon.fit()
  const { cols, rows } = term

  if (cols > 0 && rows > 0) {
    socket.sendJSON({
      type: 'resize',
      cols,
      rows,
    })
  }
}

// 创建防抖版本（100ms）
const debounceResize = debounce(resizeScreen, 100)

onMounted(async () => {
  // 初始化终端
  term = new Terminal({
    allowProposedApi: true, // 启用实验API(Unicode11Addon需要)
    // rows: 30,
    // cols: 1000,
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

  // 建立 WebSocket
  socket = createWS(
    props.uuid,
    (data) => {
      term?.write(data)
    },
    () => {
      // 等待 DOM 稳定后向服务器更新仿终端尺寸
      nextTick(async () => {
        await document.fonts.ready
        requestAnimationFrame(() => {
          debounceResize()
        })
      })
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

  // 监听窗口大小变化
  resizeObserver = new ResizeObserver(() => {
    debounceResize()
  })
  resizeObserver.observe(termElement.value!)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  socket?.close()
  term?.dispose()
})

// 暴露给父组件发送命令的方法
defineExpose({ sendCommand, getTerminalSize })
</script>

<template>

  <div class="relative rounded-md shadow my-2 p-2" style="background-color: #212121;">
    <div class="h-[60vh]" ref="termElement"></div>

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