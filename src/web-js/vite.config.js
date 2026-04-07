import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有
  // `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      tailwindcss(),
      vue(),
      vueDevTools(),
    ],
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 6996, // 设置开发服务器端口
      open: true  // 自动打开浏览器
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    define: {
      // 注入为全局常量，注意值需要 JSON.stringify 处理
      __API_PORT__: JSON.stringify(env.API_PORT),
    }
  }
})