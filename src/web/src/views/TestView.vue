<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-6">
    <!-- 主容器 -->
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-base-content">服务器管理面板</h1>
        <p class="text-base-content/70 mt-1">实时监控与终端交互</p>
      </div>

      <!-- 左右两列布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左侧：服务器信息卡片 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="flex justify-between items-center mb-2">
              <h2 class="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                系统信息
              </h2>
              <button class="btn btn-sm btn-outline" @click="refreshServerInfo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                刷新数据
              </button>
            </div>

            <!-- 基本信息区域 使用 stat 组件 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title">主机名</div>
                <div class="stat-value text-2xl">{{ serverInfo.hostname }}</div>
                <div class="stat-desc">{{ serverInfo.os }}</div>
              </div>
              <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title">运行时间</div>
                <div class="stat-value text-2xl">{{ formattedUptime }}</div>
                <div class="stat-desc">已启动</div>
              </div>
            </div>

            <div class="divider my-1"></div>

            <!-- CPU 信息 -->
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold">CPU 使用率</span>
                <span class="badge badge-outline">{{ serverInfo.cpuUsage }}%</span>
              </div>
              <progress class="progress progress-primary w-full" :value="serverInfo.cpuUsage" max="100"></progress>
              <p class="text-xs text-base-content/60 mt-1">{{ serverInfo.cpuModel }}</p>
            </div>

            <!-- 内存信息 -->
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold">内存</span>
                <span class="badge badge-outline">{{ serverInfo.memUsage }}%</span>
              </div>
              <progress class="progress progress-secondary w-full" :value="serverInfo.memUsage" max="100"></progress>
              <div class="flex justify-between text-sm mt-1">
                <span>已用: {{ serverInfo.memUsed }} GB</span>
                <span>总计: {{ serverInfo.memTotal }} GB</span>
              </div>
            </div>

            <!-- 磁盘信息 -->
            <div class="mb-2">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold">磁盘 (/)</span>
                <span class="badge badge-outline">{{ serverInfo.diskUsage }}%</span>
              </div>
              <progress class="progress progress-accent w-full" :value="serverInfo.diskUsage" max="100"></progress>
              <div class="flex justify-between text-sm mt-1">
                <span>已用: {{ serverInfo.diskUsed }} GB</span>
                <span>总计: {{ serverInfo.diskTotal }} GB</span>
              </div>
            </div>

            <!-- 附加网络信息（装饰） -->
            <div class="mt-4 text-xs text-base-content/50 flex gap-3">
              <span>🌐 IP: 192.168.1.100</span>
              <span>📡 上行: 1.2 Mbps</span>
              <span>📥 下行: 3.4 Mbps</span>
            </div>
          </div>
        </div>

        <!-- 右侧：终端模拟器卡片 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-0 flex flex-col h-full">
            <!-- 终端标题栏 -->
            <div class="flex justify-between items-center p-4 border-b border-base-300">
              <div class="flex items-center gap-2">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <h3 class="font-mono text-sm font-semibold">终端 · 模拟器</h3>
              </div>
              <button class="btn btn-xs btn-ghost" @click="clearTerminal" title="清屏">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>

            <!-- 终端输出区域 (滚动) -->
            <div ref="terminalOutputRef" class="bg-black text-green-400 font-mono text-sm p-4 h-96 overflow-y-auto flex-1">
              <div v-for="(line, idx) in terminalLines" :key="idx" class="whitespace-pre-wrap break-words leading-relaxed">
                {{ line }}
              </div>
              <!-- 模拟光标占位 -->
              <span class="inline-block w-2 h-4 bg-green-400 animate-pulse align-middle"></span>
            </div>

            <!-- 命令输入行 -->
            <div class="p-3 border-t border-base-300 bg-base-100">
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm text-base-content/70">$</span>
                <input
                  v-model="currentCommand"
                  type="text"
                  class="input input-bordered input-sm font-mono flex-1 bg-base-200"
                  placeholder="输入命令 (help 查看帮助)..."
                  @keyup.enter="executeCommand"
                  autofocus
                />
                <button class="btn btn-sm btn-primary" @click="executeCommand">执行</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

// ---------- 服务器信息模拟 ----------
const serverInfo = reactive({
  hostname: 'myserver',
  os: 'Ubuntu 22.04.3 LTS',
  cpuModel: 'Intel Xeon Platinum 8370C (2核)',
  cpuUsage: 23,
  memTotal: 15.6,      // GB
  memUsed: 5.2,
  memUsage: 33,
  diskTotal: 98.3,
  diskUsed: 38.2,
  diskUsage: 39,
})

// 启动时间戳 (用于计算 uptime)
const startTimestamp = ref(Date.now())
let uptimeInterval = null
let dataRefreshInterval = null

// 格式化 uptime (秒 -> 天时分)
const formattedUptime = computed(() => {
  const seconds = Math.floor((Date.now() - startTimestamp.value) / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分`
  } else {
    return `${minutes}分`
  }
})

// 模拟随机更新服务器负载 (CPU, 内存, 磁盘)
const randomizeServerMetrics = () => {
  // CPU 使用率 10~95%
  serverInfo.cpuUsage = Math.floor(Math.random() * 85) + 10
  // 内存使用率 20~85%
  const memUsagePercent = Math.floor(Math.random() * 65) + 20
  serverInfo.memUsage = memUsagePercent
  serverInfo.memUsed = +(serverInfo.memTotal * (memUsagePercent / 100)).toFixed(1)
  // 磁盘使用率 25~75%
  const diskUsagePercent = Math.floor(Math.random() * 50) + 25
  serverInfo.diskUsage = diskUsagePercent
  serverInfo.diskUsed = +(serverInfo.diskTotal * (diskUsagePercent / 100)).toFixed(1)
}

// 手动刷新（同时终端输出通知）
const refreshServerInfo = () => {
  randomizeServerMetrics()
  addTerminalLine('[系统] 服务器信息已手动刷新 (CPU/MEM/DISK 已更新)')
}

// 启动自动数据刷新 (每8秒)
const startAutoRefresh = () => {
  dataRefreshInterval = setInterval(() => {
    randomizeServerMetrics()
    // 可选静默更新，但不在终端输出，避免打扰，若需要可取消注释下一行
    // addTerminalLine('[后台] 服务器指标已自动更新')
  }, 8000)
}

// ---------- 终端模拟器逻辑 ----------
const terminalLines = ref([
  'Welcome to Server Terminal v1.0',
  'Type "help" to see available commands.',
  '--------------------------------------',
  ''
])
const currentCommand = ref('')
const terminalOutputRef = ref(null)

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (terminalOutputRef.value) {
    terminalOutputRef.value.scrollTop = terminalOutputRef.value.scrollHeight
  }
}

// 添加一行输出 (自动换行、滚动)
const addTerminalLine = (line) => {
  terminalLines.value.push(line)
  scrollToBottom()
}

// 清屏 (保留欢迎信息)
const clearTerminal = () => {
  terminalLines.value = [
    'Welcome to Server Terminal v1.0',
    'Type "help" to see available commands.',
    '--------------------------------------',
    ''
  ]
  scrollToBottom()
}

// 处理用户命令 (模拟)
const processCommand = (cmd) => {
  const trimmed = cmd.trim().toLowerCase()
  if (trimmed === '') return

  // 解析命令与参数
  const parts = trimmed.split(/\s+/)
  const command = parts[0]
  const args = parts.slice(1)

  // 命令路由
  switch (command) {
    case 'help':
      addTerminalLine('可用命令:')
      addTerminalLine('  help       - 显示帮助信息')
      addTerminalLine('  clear      - 清空终端屏幕')
      addTerminalLine('  cpu        - 显示当前CPU使用率')
      addTerminalLine('  mem        - 显示内存使用详情')
      addTerminalLine('  disk       - 显示磁盘使用详情')
      addTerminalLine('  status     - 显示系统概要信息')
      addTerminalLine('  refresh    - 手动刷新服务器信息 (同刷新按钮)')
      addTerminalLine('  echo [msg] - 回显消息')
      addTerminalLine('  uptime     - 显示系统运行时间')
      break

    case 'clear':
      clearTerminal()
      break

    case 'cpu':
      addTerminalLine(`CPU 型号: ${serverInfo.cpuModel}`)
      addTerminalLine(`当前使用率: ${serverInfo.cpuUsage}%`)
      break

    case 'mem':
      addTerminalLine(`内存总量: ${serverInfo.memTotal} GB`)
      addTerminalLine(`已使用: ${serverInfo.memUsed} GB (${serverInfo.memUsage}%)`)
      addTerminalLine(`可用: ${(serverInfo.memTotal - serverInfo.memUsed).toFixed(1)} GB`)
      break

    case 'disk':
      addTerminalLine(`磁盘总量: ${serverInfo.diskTotal} GB`)
      addTerminalLine(`已使用: ${serverInfo.diskUsed} GB (${serverInfo.diskUsage}%)`)
      addTerminalLine(`剩余: ${(serverInfo.diskTotal - serverInfo.diskUsed).toFixed(1)} GB`)
      break

    case 'status':
      addTerminalLine(`主机名: ${serverInfo.hostname}`)
      addTerminalLine(`操作系统: ${serverInfo.os}`)
      addTerminalLine(`运行时间: ${formattedUptime.value}`)
      addTerminalLine(`CPU 使用率: ${serverInfo.cpuUsage}%`)
      addTerminalLine(`内存使用率: ${serverInfo.memUsage}%`)
      addTerminalLine(`磁盘使用率: ${serverInfo.diskUsage}%`)
      break

    case 'refresh':
      randomizeServerMetrics()
      addTerminalLine('✅ 服务器信息已刷新 (CPU/内存/磁盘更新)')
      break

    case 'uptime':
      addTerminalLine(`系统已运行: ${formattedUptime.value}`)
      break

    case 'echo':
      if (args.length === 0) {
        addTerminalLine('echo: 缺少参数')
      } else {
        addTerminalLine(args.join(' '))
      }
      break

    default:
      addTerminalLine(`命令未找到: ${command}，输入 "help" 获取帮助。`)
      break
  }
}

// 执行命令: 将命令本身回显到终端，再处理输出
const executeCommand = () => {
  const cmdText = currentCommand.value
  if (!cmdText.trim()) {
    currentCommand.value = ''
    return
  }
  // 显示用户输入的命令行 (模拟终端提示符)
  addTerminalLine(`> ${cmdText}`)
  // 处理命令
  processCommand(cmdText)
  // 清空输入框
  currentCommand.value = ''
  // 滚动到底部 (已由addTerminalLine自动触发)
  scrollToBottom()
}

// 添加初始终端欢迎语
const initTerminal = () => {
  addTerminalLine('终端已就绪，输入 help 查看命令列表。')
  addTerminalLine('')
}

// ---------- 生命周期 ----------
onMounted(() => {
  // 随机初始服务器指标
  randomizeServerMetrics()
  // 启动运行时间计时器 (每秒更新)
  uptimeInterval = setInterval(() => {
    // 仅仅触发 computed 更新 (无需额外操作)
  }, 1000)
  // 启动自动数据刷新
  startAutoRefresh()
  // 终端初始化额外信息
  initTerminal()
  // 保证终端滚动到底部
  scrollToBottom()
})

onBeforeUnmount(() => {
  if (uptimeInterval) clearInterval(uptimeInterval)
  if (dataRefreshInterval) clearInterval(dataRefreshInterval)
})
</script>

<style scoped>
/* 自定义滚动条美观 (可选) */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
</style>