<script setup lang="ts">
import { computed } from 'vue';
import type { ServerType } from '@/types/ServerType';
import MainTitle from '../MainTitle.vue';

interface Props {
  server: ServerType | null;
  actionLoading?: boolean;
}

const props = defineProps<Props>()

defineEmits(['start', 'stop', 'restart'])

const statusText = computed(() => {
  // 如果在运行就显示正在运行，
  // 如果不在运行就显示未运行，
  // 文件不存在最后判断因为有可能是通过bash启动不存在路径
  if (props.server?.isRunning) {
    return '正在运行'
  } else if (!props.server?.fileExist) {
    return '文件不存在'
  } else {
    return '未运行'
  }
})

// 颜色映射不能拼接不然Tailwind会被裁切掉相关样式
const statusMap: { [key: string]: string } = {
  none: '',
  success: 'status-success',
  error: 'status-error'
}

const badgeMap: { [key: string]: string } = {
  none: '',
  success: 'badge-success',
  error: 'badge-error'
}
const state = computed(() => {
  if (props.server?.isRunning) {
    return 'success'
  } else if (!props.server?.fileExist) {
    return 'none'
  } else {
    return 'error'
  }
})

const status = computed(() => statusMap[state.value])
const badge = computed(() => badgeMap[state.value])
const animate = computed(() => {props.server?.isRunning ? 'animate-ping' : ''})
</script>

<template>
  <MainTitle>
    <div class="flex justify-between mb-3">
      <div>
        <div class="flex gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="m7 11l2-2l-2-2m4 6h4" />
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            </g>
          </svg>
          <p class="text-xl">{{ server?.name ?? '读取中' }}</p>
          <div class="badge badge-soft shadow" :class="badge">
            <div class="inline-grid *:[grid-area:1/1]">
              <div class="status" :class="[status, animate]"></div>
              <div class="status" :class="status"></div>
            </div>
            {{ statusText }}
          </div>
        </div>
        <p class="font-mono text-xs">{{ server?.uuid ?? '-' }}</p>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-outline btn-success" :disabled="server?.isRunning" @click="$emit('start')">
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

        <button class="btn btn-outline btn-info" @click="$emit('restart')">
          <span v-show="actionLoading" class="loading loading-spinner size-[1.2em]"></span>
          <svg v-show="!actionLoading" class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9a9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5m-5 4a9 9 0 0 0 9 9a9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </g>
          </svg>
          重启
        </button>
      </div>

    </div>
  </MainTitle>
</template>