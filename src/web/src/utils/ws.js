export function createWS(uuid, onMessage) {
  let ws;
  let timer;

  function connect() {
    ws = new WebSocket(`ws://localhost:${__API_PORT__}?uuid=${uuid}`);

    ws.onmessage = (e) => {
      onMessage(e.data);
    };

    ws.onclose = () => {
      console.log('重连中...', ws);
      timer = setTimeout(connect, 2000);
    };
  }

  connect();

  return {
    send: (msg) => ws?.send(msg),
    close: () => {
      clearTimeout(timer);
      ws?.close();
    }
  };
}