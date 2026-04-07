<script setup lang="ts">
import { computed } from 'vue';
import { useSystemMonitorStore } from '@/stores/SystemMonitorStore';
import formatUptime from '@/utils/format/uptime';

const systemMonitorStore = useSystemMonitorStore();
const systemInfo = computed(() => systemMonitorStore.MonitorData?.system_info)
const formatedUptime = computed(() => systemInfo.value ? formatUptime(systemInfo.value.uptime) : '-')

</script>

<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="flex justify-between items-center">
                <h2 class="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <rect width="14" height="8" x="5" y="2" rx="2" />
                            <rect width="20" height="8" x="2" y="14" rx="2" />
                            <path d="M6 18h2m4 0h6" />
                        </g>
                    </svg>
                    系统信息
                </h2>
            </div>

            <div class="join join-vertical gap-2">
                <div class="join-item">
                    <div class="flex gap-2">
                        <div>
                            <button class="btn btn-square">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2">
                                        <rect width="18" height="18" x="3" y="3" rx="2" />
                                        <circle cx="12" cy="10" r="3" />
                                        <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                                    </g>
                                </svg>
                            </button>
                        </div>
                        <div>
                            <div>{{ systemInfo?.hostname ?? '-' }}</div>
                            <div class="text-xs opacity-60">主机名</div>
                        </div>
                    </div>
                </div>

                <div class="join-item">
                    <div class="flex gap-2">
                        <div>
                            <button class="btn btn-square">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </g>
                                </svg>
                            </button>
                        </div>
                        <div>
                            <div>{{ formatedUptime ?? '-' }}</div>
                            <div class="text-xs opacity-60">运行时长</div>
                        </div>
                    </div>
                </div>

                <div class="join-item">
                    <div class="flex gap-2">
                        <div>
                            <button class="btn btn-square">
                                <!-- Windows 图标-->
                                <svg v-if="systemInfo?.os.platform === 'win32'" xmlns="http://www.w3.org/2000/svg" width="24px"
                                    height="24px" viewBox="0 0 256 256">
                                    <path fill="#0078d4"
                                        d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z" />
                                </svg>
                                <!-- Linux 图标-->
                                <svg v-else-if="systemInfo?.os.platform === 'linux'" xmlns="http://www.w3.org/2000/svg" width="48"
                                    height="48" viewBox="0 0 48 48">
                                    <path fill="#eceff1"
                                        d="m20.1 16.2l.1 2.3l-1.6 3l-2.5 4.9l-.5 4.1l1.8 5.8l4.1 2.3h6.2l5.8-4.4l2.6-6.9l-6-7.3l-1.7-4.1z" />
                                    <path fill="#263238"
                                        d="M34.3 21.9c-1.6-2.3-2.9-3.7-3.6-6.6s.2-2.1-.4-4.6c-.3-1.3-.8-2.2-1.3-2.9c-.6-.7-1.3-1.1-1.7-1.2c-.9-.5-3-1.3-5.6.1c-2.7 1.4-2.4 4.4-1.9 10.5c0 .4-.1.9-.3 1.3c-.4.9-1.1 1.7-1.7 2.4c-.7 1-1.4 2-1.9 3.1c-1.2 2.3-2.3 5.2-2 6.3c.5-.1 6.8 9.5 6.8 9.7c.4-.1 2.1-.1 3.6-.1c2.1-.1 3.3-.2 5 .2c0-.3-.1-.6-.1-.9c0-.6.1-1.1.2-1.8c.1-.5.2-1 .3-1.6c-1 .9-2.8 1.9-4.5 2.2c-1.5.3-4-.2-5.2-1.7c.1 0 .3 0 .4-.1c.3-.1.6-.2.7-.4c.3-.5.1-1-.1-1.3s-1.7-1.4-2.4-2s-1.1-.9-1.5-1.3l-.8-.8c-.2-.2-.3-.4-.4-.5c-.2-.5-.3-1.1-.2-1.9c.1-1.1.5-2 1-3c.2-.4.7-1.2.7-1.2s-1.7 4.2-.8 5.5c0 0 .1-1.3.5-2.6c.3-.9.8-2.2 1.4-2.9s2.1-3.3 2.2-4.9c0-.7.1-1.4.1-1.9c-.4-.4 6.6-1.4 7-.3c.1.4 1.5 4 2.3 5.9c.4.9.9 1.7 1.2 2.7c.3 1.1.5 2.6.5 4.1c0 .3 0 .8-.1 1.3c.2 0 4.1-4.2-.5-7.7c0 0 2.8 1.3 2.9 3.9c.1 2.1-.8 3.8-1 4.1c.1 0 2.1.9 2.2.9c.4 0 1.2-.3 1.2-.3c.1-.3.4-1.1.4-1.4c.7-2.3-1-6-2.6-8.3" />
                                    <g fill="#eceff1" transform="translate(0 -2)">
                                        <ellipse cx="21.6" cy="15.3" rx="1.3" ry="2" />
                                        <ellipse cx="26.1" cy="15.2" rx="1.7" ry="2.3" />
                                    </g>
                                    <g fill="#212121" transform="translate(0 -2)">
                                        <ellipse cx="21.7" cy="15.5" rx="1.2" ry=".7"
                                            transform="rotate(-97.204 21.677 15.542)" />
                                        <ellipse cx="26" cy="15.6" rx="1" ry="1.3" />
                                    </g>
                                    <path fill="#ffc107"
                                        d="M39.3 35.6c-.4-.2-1.1-.5-1.7-1.4c-.3-.5-.2-1.9-.7-2.5c-.3-.4-.7-.2-.8-.2c-.9.2-3 1.6-4.4 0c-.2-.2-.5-.5-1-.5s-.7.2-.9.6s-.2.7-.2 1.7c0 .8 0 1.7-.1 2.4c-.2 1.7-.5 2.7-.5 3.7c0 1.1.3 1.8.7 2.1c.3.3.8.5 1.9.5s1.8-.4 2.5-1.1c.5-.5.9-.7 2.3-1.7c1.1-.7 2.8-1.6 3.1-1.9c.2-.2.5-.3.5-.9c0-.5-.4-.7-.7-.8m-20.1.3c-1-1.6-1.1-1.9-1.8-2.9c-.6-1-1.9-2.9-2.7-2.9c-.6 0-.9.3-1.3.7s-.8 1.3-1.5 1.8c-.6.5-2.3.4-2.7 1s.4 1.5.4 3c0 .6-.5 1-.6 1.4c-.1.5-.2.8 0 1.2c.4.6.9.8 4.3 1.5c1.8.4 3.5 1.4 4.6 1.5s3 0 3-2.7c.1-1.6-.8-2-1.7-3.6m1.9-18.1c-.6-.4-1.1-.8-1.1-1.4s.4-.8 1-1.3c.1-.1 1.2-1.1 2.3-1.1s2.4.7 2.9.9c.9.2 1.8.4 1.7 1.1c-.1 1-.2 1.2-1.2 1.7c-.7.2-2 1.3-2.9 1.3c-.4 0-1 0-1.4-.1c-.3-.1-.8-.6-1.3-1.1" />
                                    <path fill="#634703"
                                        d="M20.9 17c.2.2.5.4.8.5c.2.1.5.2.5.2h.9c.5 0 1.2-.2 1.9-.6c.7-.3.8-.5 1.3-.7c.5-.3 1-.6.8-.7s-.4 0-1.1.4c-.6.4-1.1.6-1.7.9c-.3.1-.7.3-1 .3h-.9c-.3 0-.5-.1-.8-.2c-.2-.1-.3-.2-.4-.2c-.2-.1-.6-.5-.8-.6c0 0-.2 0-.1.1zm3-2.2c.1.2.3.2.4.3s.2.1.2.1c.1-.1 0-.3-.1-.3c0-.2-.5-.2-.5-.1m-1.6.2c0 .1.2.2.2.1c.1-.1.2-.2.3-.2c.2-.1.1-.2-.2-.2c-.2.1-.2.2-.3.3" />
                                    <path fill="#455a64"
                                        d="M32 32.7v.3c.2.4.7.5 1.1.5c.6 0 1.2-.4 1.5-.8c0-.1.1-.2.2-.3c.2-.3.3-.5.4-.6c0 0-.1-.1-.1-.2c-.1-.2-.4-.4-.8-.5c-.3-.1-.8-.2-1-.2c-.9-.1-1.4.2-1.7.5c0 0 .1 0 .1.1c.2.2.3.4.3.7c.1.2 0 .3 0 .5" />
                                </svg>
                                <!-- 默认未知图标-->
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01" />
                                    </g>
                                </svg>
                            </button>
                        </div>
                        <div>
                            <div>{{ systemInfo?.os.type ?? '-' }}{{ systemInfo?.os.release ? ` (${systemInfo?.os.release})` : '' }}</div>
                            <div class="text-xs opacity-60">操作系统</div>
                        </div>
                    </div>
                </div>

                <div class="join-item">
                    <div class="flex gap-2">
                        <div>
                            <button class="btn btn-square">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2">
                                        <path
                                            d="M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2" />
                                        <rect width="16" height="16" x="4" y="4" rx="2" />
                                        <rect width="8" height="8" x="8" y="8" rx="1" />
                                    </g>
                                </svg>
                            </button>
                        </div>
                        <div>
                            <div>{{ systemInfo?.cpu.model ?? '-' }}</div>
                            <div class="text-xs opacity-60">处理器型号</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

</template>