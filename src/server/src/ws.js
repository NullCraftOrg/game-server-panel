const WebSocket = require('ws');
const manager = require('./serverManager');
const config = require('./utils/config');

function initWS(server) {
  const wss = new WebSocket.Server({ server });

  const ip = config?.ip ?? 'localhost'

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${ip}`);
    const id = url.searchParams.get('id');

    const srv = manager.get(id);
    if (!srv) return ws.close();

    srv.clients.add(ws);

    // 补发缺失日志
    for (const item of srv.logBuffer) {
      ws.send(item);
    }

    ws.on('message', (msg) => {
      srv.sendCommand(msg.toString("utf-8"));
    });

    ws.on('close', () => {
      srv.clients.delete(ws);
    });
  });
}

module.exports = initWS;