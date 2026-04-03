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

// 颜色映射不能拼接不然Tailwind会被裁切掉相关样式
const statusMap = {
  success: 'status-success',
  error: 'status-error'
}

const state = computed(() => {
  if (!props.fileExist) return ''
  return props.isRunning ? 'success' : 'error'
})
const status = computed(() => statusMap[state.value])

const animate = computed(() => props.fileExist ? 'animate-ping' : '')
</script>

<template>
  <div class="inline-grid *:[grid-area:1/1]">
    <div class="status" :class="status, animate"></div>
    <div class="status" :class="status"></div>
  </div>
</template>