const BASE = `http://localhost:${__API_PORT__}/api`

export const api = {

  // 获取全部服务器
  getServers: () => fetch(`${BASE}/servers`).then(r => r.json()),

  // 获取指定服务器
  getServer: (id) => fetch(`${BASE}/servers/${id}`).then(r => r.json()),

  // 启动指定服务器
  startServer: (id) => fetch(`${BASE}/servers/${id}/start`, { method: 'POST' }),

  // 停止指定服务器
  stopServer: (id) => fetch(`${BASE}/servers/${id}/stop`, { method: 'POST' }),

  // 创建服务器
  createServer: (data) =>
    fetch(`${BASE}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // 更新指定服务器
  updateServer: (id, data) =>
    fetch(`${BASE}/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // 删除指定服务器
  deleteServer: (id) =>
    fetch(`${BASE}/servers/${id}`, { method: 'DELETE' }),

  // 获取服务器信息
  getServerInfo: (id) => fetch(`${BASE}/servers/${id}/info`).then(r => r.json()),

  // 通过 HTTP 获取历史日志
  // 2026-03-23 注：终端页面中补发日志功能使用 WebsSocket 连接时发送。
  getServerLog: (id) =>
    fetch(`${BASE}/servers/${id}/log`).then(r => r.json())
}