const BASE = `http://localhost:${__API_PORT__}/api`

export const api = {

  getMonitor: () => fetch(`${BASE}/monitor`).then(r => r.json()),

  // 获取全部服务器
  getServers: () => fetch(`${BASE}/servers`).then(r => r.json()),

  // 获取指定服务器
  getServer: (uuid) => fetch(`${BASE}/servers/${uuid}`).then(r => r.json()),

  // 启动指定服务器
  startServer: (uuid) => fetch(`${BASE}/servers/${uuid}/start`, { method: 'POST' }),

  // 停止指定服务器
  stopServer: (uuid) => fetch(`${BASE}/servers/${uuid}/stop`, { method: 'POST' }),

  // 重启指定服务器
  restartServer: (uuid) => fetch(`${BASE}/servers/${uuid}/restart`, { method: 'POST' }),

  // 创建服务器
  createServer: (data) =>
    fetch(`${BASE}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // 更新指定服务器
  updateServer: (uuid, data) =>
    fetch(`${BASE}/servers/${uuid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // 删除指定服务器
  deleteServer: (uuid) =>
    fetch(`${BASE}/servers/${uuid}`, { method: 'DELETE' }),

  // 获取服务器信息
  getServerInfo: (uuid) => fetch(`${BASE}/servers/${uuid}/info`).then(r => r.json()),

  // 通过 HTTP 获取历史日志
  // 2026-03-23 注：终端页面中补发日志功能使用 WebsSocket 连接时发送。
  getServerLog: (uuid) =>
    fetch(`${BASE}/servers/${uuid}/log`).then(r => r.json())
}