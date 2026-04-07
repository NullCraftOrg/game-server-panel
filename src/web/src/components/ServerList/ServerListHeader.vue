<script setup lang="ts">
defineEmits(['create', 'refresh'])
</script>

<template>
  <div class="flex justify-end gap-2 mb-3">
    <button class="btn btn-primary" @click="$emit('create')">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 12h14m-7-7v14" />
      </svg>
      新建服务器
    </button>
    <button class="btn" @click="$emit('refresh')">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M21 12a9 9 0 0 0-9-9a9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5m-5 4a9 9 0 0 0 9 9a9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </g>
      </svg>
      刷新服务器
    </button>
  </div>
</template>