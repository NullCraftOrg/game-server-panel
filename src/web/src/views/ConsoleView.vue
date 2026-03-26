<script setup>
import { useRoute } from 'vue-router'
import Console from '@/components/Console.vue'

const route = useRoute()
</script>

<template>
  <Console :id="route.params.id" />
</template>