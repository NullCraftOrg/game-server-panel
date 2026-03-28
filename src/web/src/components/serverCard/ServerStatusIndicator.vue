<script setup>
defineProps({
  isRunning: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div class="inline-grid *:[grid-area:1/1]">
    <template v-if="isRunning">
      <div class="status status-success animate-ping"></div>
      <div class="status status-success"></div>
    </template>
    <template v-else>
      <div class="status status-error animate-ping"></div>
      <div class="status status-error"></div>
    </template>
  </div>
</template>