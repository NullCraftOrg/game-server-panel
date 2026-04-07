<script setup lang="ts">
  defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="card-actions">
    <!-- 删除服务器按钮 -->
    <button class="btn btn-sm btn-square btn-dash btn-error" @click="$emit('delete')">
      <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </g>
      </svg>
    </button>

    <!-- 编辑服务器按钮 -->
    <button class="btn btn-sm btn-square btn-dash" @click="$emit('edit')">
      <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path
            d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
        </g>
      </svg>
    </button>
  </div>
</template>