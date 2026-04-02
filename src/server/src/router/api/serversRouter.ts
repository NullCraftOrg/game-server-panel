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

//  通过Id获取指定服务器数据
serversRouter.get('/:id', (req, res) => {
  const server = ServerManager.get(req.params.id)
  if (!server) {
    return res.status(404).end();
  }
  res.json(server);
});

// 通过Id更新服务器
serversRouter.put('/:id', (req, res) => {
  const server = ServerManager.update(req.params.id, req.body)
  if (!server) {
    return res.status(404).end();
  }
  res.json(server);
});

// 通过Id删除服务器
serversRouter.delete('/:id', (req, res) => {
  const serverId = ServerManager.delete(req.params.id)
  if (req.params.id === serverId) {
    res.send('ok')
  }
  else {
    return res.status(404).end()
  }
});

// 通过Id获取服务器信息(后续考虑增加更多数据)
serversRouter.get('/:id/info', (req, res) => {
  const infoData = ServerManager.info(req.params.id)
  res.json(infoData);
});

// 通过Id获取历史日志
serversRouter.get('/:id/log', (req, res) => {
  const server = ServerManager.get(req.params.id)
  if (!server) {
    return res.status(404).end();
  }

  res.json({
    logs: server.logBuffer
  });
});

// 通过Id管理服务器
serversRouter.post('/:id/start', (req, res) => {
  ServerManager.get(req.params.id)?.start()
  res.send('ok')
});

serversRouter.post('/:id/stop', (req, res) => {
  ServerManager.get(req.params.id)?.stop()
  res.send('ok')
});

export default serversRouter