const BASE = 'http://localhost:5678/api'

export const api = {

  startServer: (id) => fetch(`${BASE}/servers/${id}/start`, { method: 'POST' }),

  stopServer: (id) => fetch(`${BASE}/servers/${id}/stop`, { method: 'POST' }),

  getServers: () => fetch(`${BASE}/servers`).then(r => r.json()),

  getServer: (id) => fetch(`${BASE}/servers/${id}`).then(r => r.json()),

  createServer: (data) =>
    fetch(`${BASE}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateServer: (id, data) =>
    fetch(`${BASE}/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deleteServer: (id) =>
    fetch(`${BASE}/servers/${id}`, { method: 'DELETE' }),

  getServerInfo: (id) => fetch(`${BASE}/servers/${id}/info`).then(r => r.json()),

  getServerLog: (id) =>
    fetch(`${BASE}/servers/${id}/log`).then(r => r.json())
}