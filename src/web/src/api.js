const BASE = 'http://localhost:5678/api'

export const api = {
  getServers: () => fetch(`${BASE}/servers`).then(r => r.json()),

  createServer: (data) =>
    fetch(`${BASE}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  start: (id) => fetch(`${BASE}/servers/${id}/start`, { method: 'POST' }),

  stop: (id) => fetch(`${BASE}/servers/${id}/stop`, { method: 'POST' }),

  delete: (id) =>
    fetch(`${BASE}/servers/${id}`, { method: 'DELETE' }),

  getLog: (id) =>
    fetch(`${BASE}/servers/${id}/log`).then(r => r.json())
}