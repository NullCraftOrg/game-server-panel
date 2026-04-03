<script setup>
import { computed } from 'vue';

const props = defineProps({
  fileExist: {
    type: Boolean,
    required: false
  },
  isRunning: {
    type: Boolean,
    required: true
  }
})

const animate = computed(() => {
  if (props.fileExist) {
    return 'animate-ping'
  }
})

const status = computed(() => {
  // 如果可执行文件不存在则返回灰色状态
  if (!props.fileExist) {
    return ''
  }

  // 文件存在则更新运行状态
  if (props.isRunning) {
    return 'success'
  } else {
    return 'error'
  }
})
</script>

<template>
  <div class="inline-grid *:[grid-area:1/1]">
    <div class="status" :class="status ? 'status-' + status : '', animate"></div>
    <div class="status" :class="status ? 'status-' + status : ''"></div>
  </div>
</template>