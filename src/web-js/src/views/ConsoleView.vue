<script setup>
import { useRoute } from 'vue-router'
import Console from '@/components/Console.vue'

const route = useRoute()
</script>

<template>
  <Console :uuid="route.params.uuid" />
</template>