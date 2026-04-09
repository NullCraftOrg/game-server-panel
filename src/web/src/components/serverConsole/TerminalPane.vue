<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createWS, type WSType } from '@/utils/ws'
// xterm 终端相关
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { Unicode11Addon } from '@xterm/addon-unicode11';

const props = defineProps<{
  uuid: string,
  usePty: boolean,
  isRunning?: boolean
}>()

console.log('TerminalPane props', props)

const termElement: { value: HTMLElement | null } = ref(null)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: WSType

// 滚动终端底部按钮显示状态
const showTermScrollButton = ref(true)
// 点击按钮滚动到底部
const termScrollToBottom = () => {
  term?.scrollToBottom();
};

// 发送命令
const sendCommand = (command: string) => {
  if (socket) {
    socket.send(command + '\r')
  } else {
    console.warn('WebSocket未连接，无法发送命令')
  }
}

// 跟随窗口大小变化自适应
function resizeScreen() {
  try {
    fitAddon?.fit()
  } catch (e: any) {
    console.log('resizeScreenError', e.message)
  }
}

onMounted(async () => {
  // 初始化终端
  term = new Terminal({
    allowProposedApi: true, // 启用实验API(Unicode11Addon需要)
    rows: 32,
    cols: 1000,
    cursorBlink: true,
    convertEol: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: {
      cursor: '#FFFFFF',        // 光标

      background: '#212121',    // 背景色
      foreground: '#d8d8d8',    // 前景色

      black: "#232634",   // 黑色 f30 b40
      red: "#e78284",     // 红色 f31 b41
      green: "#07962a",   // 绿色 f32 b42
      yellow: "#f0c674",  // 黄色 f33 b43
      blue: "#8caaee",    // 蓝色 f34 b44
      magenta: "#ca9ee6", // 品红色(紫色) f35 b45
      cyan: "#3A96DD",    // 青色 f36 b46
      white: "#b5bfe2",   // 白色 f37 b47

      brightBlack: "#767676",   // 亮黑色 f90 b100
      brightRed: "#E74856",     // 亮红色 f91 b101
      brightGreen: "#16C60C",   // 亮绿色 f92 b102
      brightYellow: "#F9F1A5",  // 亮黄色 f93 b103
      brightBlue: "#3B78FF",    // 亮蓝色 f94 b104
      brightMagenta: '#B4009E', // 亮品红色(亮紫色) f95 b105
      brightCyan: "#61D6D6",    // 亮青色 f96 b106
      brightWhite: "#F2F2F2",   // 亮白色 f97 b107

    }
    // 目前还没有使用场景。
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

  // 监听滚动事件，控制滚动到底部按钮显示
  term.onScroll(() => {
    // buffer.active.viewportY: 当前滚动到的行位置
    // buffer.active.baseY: 终端内容的总行数（减去视口高度）
    // 如果 viewportY < baseY，说明滚动条不在最下方
    if (term) {
      showTermScrollButton.value = term.buffer.active.viewportY >= term.buffer.active.baseY;
    }
  });

  // 建立 WebSocket
  socket = createWS(
    props.uuid,
    (data) => {
      term?.write(data)
    }
  )

  // 发送终端输入数据到服务器
  let inputBuffer = ''
  term.onData((data) => {
    // 当服务器未运行时，禁止输入内容
    if (!props.isRunning) return

    // 如果使用了仿真模拟则直接发送输入数据，否则模拟传统终端行为回车后整体发送
    if (props.usePty) {
      socket?.send(data)
    }
    else {
      if (data === '\r') {
        socket.send(inputBuffer + '\n')
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
  <div class="relative rounded-box shadow-sm my-2 p-2" style="background-color: #212121;">
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