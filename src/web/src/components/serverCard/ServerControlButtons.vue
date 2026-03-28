<script setup>
defineProps({
  loading: Boolean,
  isRunning: {
    type: Boolean,
    required: true
  }
})

defineEmits(['start', 'stop', 'console'])
</script>

<template>
  <div class="card-actions">
    <!-- 启动按钮 -->
    <button class="btn btn-sm btn-soft btn-success" :class="[isRunning ? 'btn-disabled' : '']" @click="$emit('start')">
      <span v-show="loading" class="size-[1.2em] loading loading-spinner"></span>
      <svg v-show="!loading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24"
        height="24" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
      </svg>
    </button>

    <!-- 停止按钮 -->
    <button class="btn btn-sm btn-square btn-soft btn-error" @click="$emit('stop')">
      <span v-show="loading" class="size-[1.2em] loading loading-spinner"></span>
      <svg v-show="!loading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24"
        height="24" viewBox="0 0 24 24">
        <rect width="18" height="18" x="3" y="3" fill="none" stroke="currentColor" stroke-linecap="round"
          stroke-linejoin="round" stroke-width="2" rx="2" />
      </svg>
    </button>

    <!-- 控制台按钮 -->
    <button class="btn btn-sm btn-square" @click="$emit('console')">
      <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="m7 11l2-2l-2-2m4 6h4" />
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        </g>
      </svg>
    </button>
  </div>
</template>