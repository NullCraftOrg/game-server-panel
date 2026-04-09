<script setup lang="ts">
import { useTheme } from '@/utils/useTheme';
import { computed } from 'vue';

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
</script>

<template>
    <div class="bg-base-100 navbar flex justify-between shadow">
        <a class="btn btn-ghost text-xl ml-1" href="/">NGSP</a>

        <ul class="menu menu-horizontal gap-2">
            <li>
                <RouterLink to="/" exactActiveClass="menu-active">仪表盘</RouterLink>
            </li>
            <li>
                <RouterLink to="/servers" exactActiveClass="menu-active">服务器列表</RouterLink>
            </li>

        </ul>

        <div class="dropdown dropdown-bottom dropdown-end">
            <div tabindex="0" class="btn btn-sm btn-ghost">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"
                        d="m14.622 17.897l-10.68-2.913M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0zM9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
                </svg>
                {{ currentMode }}
                <svg width="12px" height="12px" class="mt-px hidden size-2 fill-current opacity-60 sm:inline-block"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
            </div>
            <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-sm">
                <li class="menu-title text-xs">切换主题</li>
                <li>
                    <a @click="switchToLight">
                        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                    <a @click="switchToDark">
                        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                        </svg>
                        深色
                    </a>
                </li>

                <li>
                    <a @click="switchToAuto">
                        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 2v2m2.837 12.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715M16 12a4 4 0 0 0-4-4m7-3l-1.256 1.256M20 12h2" />
                        </svg>
                        跟随系统
                    </a>
                </li>
            </ul>
        </div>

    </div>
</template>