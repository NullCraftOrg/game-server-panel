const express = require('express');
const router = express.Router();
const manager = require('./serverManager');

router.get('/servers', (req, res) => {
    res.json(manager.list());
});

router.post('/servers', (req, res) => {
    const server = manager.create(req.body);
    res.json(server);
});

router.get('/servers/:id', (req, res) => {
  const server = manager.get(req.params.id);
  res.json(server);
});

router.post('/servers/:id/start', (req, res) => {
    manager.get(req.params.id)?.start();
    res.send('ok');
});

router.post('/servers/:id/stop', (req, res) => {
    manager.get(req.params.id)?.stop();
    res.send('ok');
});

router.delete('/servers/:id', (req, res) => {
  manager.servers.delete(req.params.id);
  manager.save();
  res.send('ok');
});


router.get('/servers/:id/log', (req, res) => {
  const server = manager.get(req.params.id);
  if (!server) return res.status(404).end();

  res.json({
  logs: server.logBuffer.map(i => i.text).join('')
});
});

module.exports = router;