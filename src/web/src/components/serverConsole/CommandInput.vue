<script setup>
import { ref } from 'vue'

const command = ref('say 你好，世界！ hello, world!')
const emit = defineEmits(['send'])

const send = () => {
  if (command.value.trim()) {
    emit('send', command.value)
  }
}
</script>

<template>
  <div class="flex gap-2">
    <label class="input input-sm w-full">
      <svg class="h-[1.25em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 19h8M4 17l6-6l-6-6" />
      </svg>
      <input type="text" class="grow" v-model="command" placeholder="发送命令至终端" @keyup.enter="send" />
    </label>
    <button class="btn btn-sm" @click="send">
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