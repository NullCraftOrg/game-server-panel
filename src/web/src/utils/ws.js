export function createWS(id, getOffset, onMessage) {
  let ws;
  let timer;

  function connect() {
    const offset = getOffset();

    ws = new WebSocket(`ws://localhost:3000?id=${id}&offset=${offset}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      onMessage(data);
    };

    ws.onclose = () => {
      console.log('重连中...');
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