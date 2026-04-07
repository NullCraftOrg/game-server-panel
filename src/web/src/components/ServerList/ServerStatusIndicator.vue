<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  fileExist?: boolean
  isRunning?: boolean
}

const props = defineProps<Props>()

// 颜色映射不能拼接不然Tailwind会被裁切掉相关样式
const statusMap: { [key: string]: string } = {
  none: '',
  success: 'status-success',
  error: 'status-error'
}

const state = computed(() => {
  if (props?.isRunning) {
    return 'success'
  } else if (!props?.fileExist) {
    return 'none'
  } else {
    return 'error'
  }
})
const status = computed(() => statusMap[state.value])

const animate = computed(() => props?.isRunning ? 'animate-ping' : '')
</script>

<template>
  <div class="inline-grid *:[grid-area:1/1]">
    <div class="status" :class="status, animate"></div>
    <div class="status" :class="status"></div>
  </div>
</template>