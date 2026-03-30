<script setup>
defineProps({
  server: {
    type: Object,
    required: true
  },
  actionLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['start', 'stop'])
</script>

<template>
  <div class="flex justify-between mb-3">
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="m7 11l2-2l-2-2m4 6h4" />
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        </g>
      </svg>
      <p class="text-xl">{{ server.name ?? '读取中' }}</p>
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
        {{ server.isRunning ? '正在运行' : '未运行' }}
      </div>
    </div>

    <div class="flex gap-2">
      <button class="btn btn-outline btn-success" :disabled="server.isRunning" @click="$emit('start')">
        <span v-show="actionLoading" class="loading loading-spinner size-[1.2em]"></span>
        <svg v-show="!actionLoading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
        </svg>
        启动
      </button>
      <button class="btn btn-outline btn-error" @click="$emit('stop')">
        <span v-show="actionLoading" class="loading loading-spinner size-[1.2em]"></span>
        <svg v-show="!actionLoading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" fill="none" stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2" rx="2" />
        </svg>
        停止
      </button>
    </div>
  </div>
</template>