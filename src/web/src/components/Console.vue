<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { createWS } from '../utils/ws'
import { api } from '../api'

const props = defineProps(['id'])

async function start(id) {
  await api.start(id)
}

async function stop(id) {
  await api.stop(id)
}

let term
let fitAddon = new FitAddon();
let socket

onMounted(async () => {
  term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: '"Fira Code", Consolas, monospace, "Powerline Extra Symbols"',
    // theme: {
    //   foreground: "#000000", //字体
    //   background: "#ECECEC", //背景色
    // }
  })

  let termElement = document.getElementById('term');

  // 加载自适应插件
  term.loadAddon(fitAddon);
  term.open(termElement);
  fitAddon.fit();

  window.addEventListener("resize", resizeScreen)
      function resizeScreen() {
        try {
          fitAddon.fit()
        } catch (e) {
          console.log("e", e.message)
        }
      }

  // 加载历史
  const data = await api.getLog(props.id)
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

  // // 输入（终端级）
  // let inputBuffer = ''

  // term.onData((data) => {
  //   if (data === '\r') {
  //     socket.send(inputBuffer + '\n')
  //     inputBuffer = ''
  //     term.write('\r\n')
  //   } else if (data === '\u007f') {
  //     // backspace
  //     inputBuffer = inputBuffer.slice(0, -1)
  //     term.write('\b \b')
  //   } else {
  //     inputBuffer += data
  //     term.write(data)
  //   }
  // })

  term.onData((data) => {
    socket.send(data + '\n')
  })
})

onUnmounted(() => {
  socket?.close()
})
</script>

<template>
  <div>
    <b>{{ props.id }}</b>
    <div>
      <button @click="start(props.id)">启动</button>
      <button @click="stop(props.id)">停止</button>
    </div>
    <div id="term"></div>
  </div>
</template>