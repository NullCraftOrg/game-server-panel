<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainTitle from '@/components/MainTitle.vue'
import Countdown from '@/components/Countdown.vue'
import { userApi } from '@/utils/api'

const usersCount = ref(0)

onMounted(async () => {
    usersCount.value = (await userApi.getUsers()).length
})
</script>

<template>
    <Teleport to="#global-container-alert">
        <div role="alert" class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>警告：后台管理功能仍处于开发阶段，绝大部分功能仅作占位展示，并无实际功能！</span>
        </div>
    </Teleport>

    <MainTitle>
        <div class="flex justify-between mb-3">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"
                        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z">
                    </path>
                </svg>
                <h3 class="text-xl font-bold">后台管理</h3>
            </div>
        </div>
    </MainTitle>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">

        <RouterLink to="/admin/users"
            class="card bg-base-100 cursor-pointer p-4 shadow-sm transition-all hover:shadow-md">
            <div class="flex items-center gap-3">
                <div class="bg-base-200 rounded-box flex items-center p-1.5 false">
                    <svg class="text-base-content/80 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <path
                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
                            <circle cx="9" cy="7" r="4" />
                        </g>
                    </svg>
                </div>
                <p class="line-clamp-1 max-2xl:text-sm">用户</p>
            </div>

            <p class="mt-2 text-2xl font-bold">
                <Countdown :count="usersCount" />
            </p>

            <div class="flex items-end justify-between gap-2">
                <p class="text-base-content/50 text-sm/none">管理用户</p>
                <div class="bg-base-200 rounded-box p-1">
                    <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="m9 18l6-6l-6-6" />
                    </svg>
                </div>
            </div>
        </RouterLink>

    </div>

</template>