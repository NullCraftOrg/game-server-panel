import express from 'express'
import ServerManager from '../../core/serverManager.ts'

const serversRouter = express.Router()

//BaseURL = /api/servers

// 返回全部可用服务器列表
serversRouter.get("/", (req, res) => {
  const servers = ServerManager.list()
  res.json(servers)
})

// 创建新服务器
serversRouter.post("/", (req, res) => {
  const server = ServerManager.create(req.body)
  res.status(201).json(server)
})

//  通过uuid获取指定服务器数据
serversRouter.get('/:uuid', (req, res) => {
  const server = ServerManager.get(req.params.uuid)
  if (!server) {
    return res.status(404).end();
  }
  res.status(200).json(server);
})

// 通过uuid更新服务器
serversRouter.put('/:uuid', (req, res) => {
  const server = ServerManager.update(req.params.uuid, req.body)
  if (!server) {
    return res.status(404).end();
  }
  res.status(200).json(server);
})

// 通过uuid删除服务器
serversRouter.delete('/:uuid', (req, res) => {
  const uuid = ServerManager.delete(req.params.uuid)
  if (req.params.uuid === uuid) {
    res.status(200).end()
  }
  else {
    res.status(404).end()
  }
})

// 通过uuid获取服务器信息(后续考虑增加更多数据)
serversRouter.get('/:uuid/info', (req, res) => {
  const infoData = ServerManager.info(req.params.uuid)
  if (!infoData) {
    return res.status(404).end()
  }
  else {
    res.status(200).json(infoData)
  }
})

// 通过uuid获取历史日志
serversRouter.get('/:uuid/log', (req, res) => {
  const server = ServerManager.get(req.params.uuid)
  if (!server) {
    return res.status(404).end();
  }

  res.status(200).json({
    logs: server.logBuffer
  })
})

// 通过 uuid 管理服务器
// 启动服务器时可选参数 cols 和 rows 用于调整终端大小
serversRouter.post('/:uuid/start', (req, res) => {
  const { uuid } = req.params
  const { cols, rows } = req.body || {}

  const server = ServerManager.get(uuid)

  if (!server) {
    return res.status(404).json({ message: 'Server not found' })
  }

  try {
    server.start({ cols, rows })
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('启动服务器失败:', error)
    res.status(500).json({ message: 'Failed to start server' })
  }
})

serversRouter.post('/:uuid/stop', (req, res) => {
  ServerManager.get(req.params.uuid)?.stop()
  res.status(200).end()
})

serversRouter.post('/:uuid/restart', (req, res) => {
  const { uuid } = req.params
  const { cols, rows } = req.body || {}

  const server = ServerManager.get(uuid)

  if (!server) {
    return res.status(404).json({ message: 'Server not found' })
  }

  server.restart({ cols, rows })
  res.status(200).end()
})

export default serversRouter