<script setup>
import { ref, onMounted, onUnmounted, onBeforeMount } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { createWS } from '@/utils/ws'
import { api } from '@/api'

import { useServerStore } from '@/stores/serverStore'

const serverStore = useServerStore()

const props = defineProps(['id'])

const inputCommand = ref('say 你好，世界！ hello, world!')

const server = ref({})

async function getServerInfo(id) {
  server.value = await serverStore.fetchServerInfo(id)
}

function send(command) {
  socket.send(command + '\r\n')
}

async function start(id) {
  await api.startServer(id)
  await getServerInfo(props.id)
}

async function stop(id) {
  await api.stopServer(id)
}

let term
let fitAddon = new FitAddon();
let socket

function resizeScreen() {
  try {
    fitAddon.fit()
  } catch (e) {
    console.log("resizeScreenError", e.message)
  }
}

onBeforeMount(() => {
  setInterval(() => getServerInfo(props.id), 1000)
})

onMounted(async () => {

  getServerInfo(props.id)

  term = new Terminal({
    cursorBlink: true,
    allowUnicode: true,
    convertEol: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    theme: {
      background: "#212121" //背景色
    }
  })

  let termElement = document.getElementById('term');

  // 加载自适应插件
  term.loadAddon(fitAddon);
  term.open(termElement);
  fitAddon.fit();
  // 自动适应文本大小
  window.addEventListener("resize", resizeScreen)

  // 加载历史
  const data = await api.getServerLog(props.id)
  if (data.logs) {
    term.write(data.logs)
  }

  // WS
  socket = createWS(
    props.id,
    (data) => {
      term.write(data)
    }
  )

  // 发送数据
  term.onData((data) => {
    socket.send(data)
  })

})

onUnmounted(() => {
  socket?.close()
})
</script>

<template>
  <div class="flex justify-between mb-2">
    
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="m7 11l2-2l-2-2m4 6h4" />
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        </g>
      </svg>
      <p class="text-xl">{{ server.name ?? "未知服务器" }}</p>

      <div class="badge badge-lg badge-ghost bg-base-100 shadow">
        <div class="inline-grid *:[grid-area:1/1]">
          <template v-if="server.isRunning">
            <div class="status status-success animate-ping"></div>
            <div class="status status-success"></div>
          </template>
          <template v-else>
            <div class="status status-error animate-ping"></div>
            <div class="status status-error"></div>
          </template>
        </div>
        {{ server.isRunning > 0 ? '正在运行' : '未运行' }}
      </div>

    </div>

    <div class="flex gap-2">
      <button class="btn btn-outline btn-success" @click="start(props.id)">
        <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
        </svg>
        启动
      </button>
      <button class="btn btn-outline btn-error" @click="stop(props.id)">
        <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" fill="none" stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2" rx="2" />
        </svg>
        停止
      </button>
    </div>
  </div>

  <div class="rounded-box shadow-sm mb-2" style="background-color: #212121;">
    <div class="p-2 min-h-[400px]" id="term"></div>
  </div>

  <div class="flex gap-2">
    <label class="input input-sm w-full">
      <svg class="h-[1.25em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 19h8M4 17l6-6l-6-6" />
      </svg>
      <input type="text" class="grow" v-model="inputCommand" placeholder="发送命令至终端" />
    </label>
    <button class="btn btn-sm" @click="send(inputCommand)">
      发送命令
      <svg class="size-[1em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="m10 16l4-4l-4-4m-7 4h11" />
          <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
        </g>
      </svg>
    </button>
  </div>
</template>