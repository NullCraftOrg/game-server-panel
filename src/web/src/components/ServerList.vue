<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import { useRouter } from 'vue-router'

const servers = ref([])
const router = useRouter()

async function load() {
  servers.value = await api.getServers()
}

async function start(id) {
  await api.start(id)
}

async function stop(id) {
  await api.stop(id)
}

async function remove(id) {
  await api.delete(id)
  load()
}

function openConsole(id) {
  router.push(`/console/${id}`)
}

onMounted(load)
</script>

<template>
  <h3>服务器列表</h3>
  <div v-for="s in servers" :key="s.id">
    <b>{{ s.name }}</b>
    <button @click="start(s.id)">启动</button>
    <button @click="stop(s.id)">停止</button>
    <button @click="openConsole(s.id)">控制台</button>
    <button @click="remove(s.id)">删除</button>
  </div>
</template>