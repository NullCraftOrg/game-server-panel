<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/serverStore'
import Console from '@/components/Console.vue'

const servers = ref([])
const router = useRouter()
// const serverStore = useServerStore();

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

function openConsole(id, server) {
   // 保存到 store
  // serverStore.setCurrentServer(server)
  router.push(`/console/${id}`)
}

onMounted(load)
</script>

<template>
  <h3>服务器列表</h3>

  <div class="grid grid-cols-4 gap-4">
    <div class="card bg-base-100 card-sm shadow-sm" v-for="s in servers" :key="s.id">
      <div class="card-body">

        <div class="card-title">
          <div class="inline-grid *:[grid-area:1/1]">
            <div class="status status-error animate-ping"></div>
            <div class="status status-error"></div>
          </div>
          <h2>
            {{ s.name }}
          </h2>
        </div>

        <!-- <p>这是一个服务器信息巴拉巴拉。。。</p> -->

        <div class="justify-end card-actions">
          <button class="btn btn-square btn-ghost" @click="openConsole(s.id, s)">
            <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="m7 11l2-2l-2-2m4 6h4" />
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

</template>