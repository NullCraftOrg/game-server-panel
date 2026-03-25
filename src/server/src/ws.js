const WebSocket = require('ws');
const manager = require('./serverManager');

function initWS(server) {
  const wss = new WebSocket.Server({ server }); // ✅ 关键点

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');

    const srv = manager.get(id);
    if (!srv) return ws.close();

    srv.clients.add(ws);

    // 补发缺失日志
    for (const item of srv.logBuffer) {
      ws.send(item);
    }

    ws.on('message', (msg) => {
      srv.sendCommand(msg.toString());
    });

    ws.on('close', () => {
      srv.clients.delete(ws);
    });
  });
}

  module.exports = initWS;