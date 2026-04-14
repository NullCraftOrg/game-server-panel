import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from '@/stores/AuthStore'

import '@xterm/xterm/css/xterm.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 启动时立即开始验证 token，但不等待结果，让请求在后台进行
const authStore = useAuthStore();
authStore.fetchAuthMe()

app.mount('#app')
