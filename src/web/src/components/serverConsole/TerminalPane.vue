<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createWS } from '@/utils/ws'
// xterm 终端相关
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { Unicode11Addon } from '@xterm/addon-unicode11';

const props = defineProps(['uuid'])

const termElement = ref(null)
let term = null
let fitAddon = null
let socket = null

// 滚动终端底部按钮显示状态
const showTermScrollButton = ref(true)
// 点击按钮滚动到底部
const termScrollToBottom = () => {
  term.scrollToBottom();
};

// 发送命令
const sendCommand = (command) => {
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
  } catch (e) {
    console.log('resizeScreenError', e.message)
  }
}

onMounted(async () => {
  // 初始化终端
  term = new Terminal({
    allowProposedApi: true, // 启用实验API(Unicode11Addon需要)
    rows: 28,
    cursorBlink: true,
    allowUnicode: true,
    convertEol: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: {
      background: "#212121",
    },
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
  term.open(termElement.value)
  // 自适应大小
  fitAddon.fit()

  // 监听滚动事件，控制滚动到底部按钮显示
  term.onScroll(() => {
    // buffer.active.viewportY: 当前滚动到的行位置
    // buffer.active.baseY: 终端内容的总行数（减去视口高度）
    // 如果 viewportY < baseY，说明滚动条不在最下方
    showTermScrollButton.value = term.buffer.active.viewportY >= term.buffer.active.baseY;
  });

  // 建立 WebSocket
  socket = createWS(
    props.uuid,
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

// 暴露给父组件发送命令的方法
defineExpose({ sendCommand })
</script>

<template>
  <div class="relative rounded-box shadow-sm my-2 p-2" style="background-color: #212121;">
    <div ref="termElement"></div>

    <Transition name="fade">
      <button v-if="!showTermScrollButton" @click="termScrollToBottom"
        class="absolute bottom-7 right-7 z-10 btn btn-square btn-sm shadow hover:scale-108 transition-transform">
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