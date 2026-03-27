const express = require('express');
const router = express.Router();
const manager = require('./serverManager');

// 获取全部服务器数据
router.get('/servers', (req, res) => {
  res.json(manager.list());
});

//  通过Id获取指定服务器数据
router.get('/servers/:id', (req, res) => {
  const server = manager.get(req.params.id);
  if (!server) {
    return res.status(404).end();
  }
  res.json(server);
});

// 创建服务器
router.post('/servers', (req, res) => {
  const server = manager.create(req.body);
  res.json(server);
});

// 通过Id更新服务器
router.put('/servers/:id', (req, res) => {
  const server = manager.update(req.params.id, req.body);
  if (!server) {
    return res.status(404).end();
  }
  res.json(server);
});

// 通过Id删除服务器
router.delete('/servers/:id', (req, res) => {
  manager.servers.delete(req.params.id);
  manager.save();
  res.send('ok');
});

// 通过Id获取服务器信息(后续考虑增加更多数据)
router.get('/servers/:id/info', (req, res) => {
  const infoData = manager.info(req.params.id);
  res.json(infoData);
});

// 通过Id获取历史日志
router.get('/servers/:id/log', (req, res) => {
  const server = manager.get(req.params.id);
  if (!server) {
    return res.status(404).end();
  }

  res.json({
    logs: server.logBuffer.map(i => i.text).join('')
  });
});

// 通过Id管理服务器
router.post('/servers/:id/start', (req, res) => {
  manager.get(req.params.id)?.start();
  res.send('ok');
});
router.post('/servers/:id/stop', (req, res) => {
  manager.get(req.params.id)?.stop();
  res.send('ok');
});

module.exports = router;