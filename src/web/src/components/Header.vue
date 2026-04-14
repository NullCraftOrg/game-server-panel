<script setup lang="ts">
import { useTheme } from '@/utils/useTheme'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()

/** 加载用户信息 */
async function loginInfo() {
    await authStore.fetchAuthMe()
}

const { setMode, getMode } = useTheme()
const switchToLight = () => setMode('light')
const switchToDark = () => setMode('dark')
const switchToAuto = () => setMode('auto')

const currentMode = computed(() => {
    const mode = getMode()
    if (mode === 'light') return '浅色'
    if (mode === 'dark') return '深色'
    if (mode === 'auto') return '跟随系统'
    return ''
})

onMounted(() => {
    loginInfo()
})
</script>

<template>
    <div class="bg-base-100 navbar flex shadow">

        <div class="navbar-start gap-2">
            <!-- 品牌 Logo -->
            <RouterLink class="btn btn-ghost text-xl" to="/">NGSP</RouterLink>

            <!-- 移动端汉堡菜单按钮小屏显示 -->
            <div class="dropdown lg:hidden">
                <label tabindex="0" class="btn btn-sm btn-ghost btn-square">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </label>
                <ul tabindex="0" class="menu dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow">
                    <li>
                        <RouterLink to="/" exactActiveClass="menu-active">
                            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24">
                                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2">
                                    <rect width="7" height="9" x="3" y="3" rx="1" />
                                    <rect width="7" height="5" x="14" y="3" rx="1" />
                                    <rect width="7" height="9" x="14" y="12" rx="1" />
                                    <rect width="7" height="5" x="3" y="16" rx="1" />
                                </g>
                            </svg>
                            仪表盘
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/servers" exactActiveClass="menu-active">
                            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24">
                                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2">
                                    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                                    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                                    <path d="M6 6h.01M6 18h.01" />
                                </g>
                            </svg>
                            服务器列表
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 大屏导航菜单(小屏隐藏) -->
        <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal gap-2">
                <li>
                    <RouterLink to="/" exactActiveClass="menu-active">
                        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2">
                                <rect width="7" height="9" x="3" y="3" rx="1" />
                                <rect width="7" height="5" x="14" y="3" rx="1" />
                                <rect width="7" height="9" x="14" y="12" rx="1" />
                                <rect width="7" height="5" x="3" y="16" rx="1" />
                            </g>
                        </svg>
                        仪表盘
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/servers" exactActiveClass="menu-active">
                        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2">
                                <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                                <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                                <path d="M6 6h.01M6 18h.01" />
                            </g>
                        </svg>
                        服务器列表
                    </RouterLink>
                </li>
            </ul>
        </div>

        <div class="navbar-end flex gap-2">
            <!-- 主题切换下拉菜单 -->
            <div class="dropdown dropdown-bottom dropdown-end">
                <div tabindex="0" class="btn btn-sm btn-ghost">
                    <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="m14.622 17.897l-10.68-2.913M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0zM9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
                    </svg>

                    <span class="hidden sm:inline">{{ currentMode }}</span>

                    <svg width="12px" height="12px" class="size-2 fill-current opacity-60"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                    </svg>
                </div>
                <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-sm">
                    <li class="menu-title text-xs">切换主题</li>
                    <li>
                        <a @click="switchToLight" :class="{ 'menu-active': getMode() === 'light' }">
                            <svg class="size-4 fill-current opacity-80" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2">
                                    <circle cx="12" cy="12" r="4" />
                                    <path
                                        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                </g>
                            </svg>
                            浅色
                        </a>
                    </li>
                    <li>
                        <a @click="switchToDark" :class="{ 'menu-active': getMode() === 'dark' }">
                            <svg class="size-4 fill-current opacity-80" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                            </svg>
                            深色
                        </a>
                    </li>
                    <li>
                        <a @click="switchToAuto" :class="{ 'menu-active': getMode() === 'auto' }">
                            <svg class="size-4 fill-current opacity-80" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 2v2m2.837 12.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715M16 12a4 4 0 0 0-4-4m7-3l-1.256 1.256M20 12h2" />
                            </svg>
                            跟随系统
                        </a>
                    </li>
                </ul>
            </div>

            <!-- 骨架占位 -->
            <div v-if="authStore.loading" class="skeleton w-28 h-8"></div>
            <template v-else>
                <!-- 用户信息下拉菜单 -->
                <div v-if="authStore.user" class="dropdown dropdown-end">
                    <div tabindex="0" class="btn btn-ghost">
                        <div class="avatar avatar-placeholder">
                            <div class="bg-neutral text-neutral-content size-6 mask mask-squircle">
                                <span class="font-bold uppercase">{{ authStore.user?.username.charAt(0) }}</span>
                            </div>
                        </div>
                        <div class="text-start max-sm:hidden">
                            <p class="text-[12px]/none">{{ authStore.user?.username }}</p>
                            <p class="text-base-content/60 text-[10px]/none">@{{ authStore.user?.role }}</p>
                        </div>

                        <svg width="12px" height="12px" class="size-2 fill-current opacity-60"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                        </svg>
                    </div>

                    <!-- 用户菜单 -->
                    <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-sm">
                        <li class="menu-title text-xs">用户菜单</li>
                        <li v-if="authStore.user?.role === 'admin'">
                            <RouterLink :to="{ name: 'Admin' }">
                                <svg class="size-4 fill-current opacity-80" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2"
                                        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
                                </svg>
                                后台管理
                            </RouterLink>
                        </li>
                        <li>
                            <a @click="authStore.logout()">
                                <svg class="size-4 fill-current opacity-80" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2"
                                        d="m16 17l5-5l-5-5m5 5H9m0 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                </svg>
                                退出登录
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- 未登录状态按钮 -->
                <div class="flex gap-2" v-else>
                    <RouterLink to="/login" class="btn btn-sm">登录</RouterLink>
                    <RouterLink to="/register" class="btn btn-sm btn-neutral">注册</RouterLink>
                </div>
            </template>

        </div>

    </div>
</template>