import http from 'http';
import cors from 'cors';
import express from 'express';

import InitWebSocket from './core/ws.ts';
// routers
import router from './router/indexRouter.ts';

const app = express();
const server = http.createServer(app);

InitWebSocket(server);

app.use(cors());
app.use(express.json());
app.use("/", router);

const ip = "localhost";
const port = 9119;

server.listen(port, ip, () => {
  console.log(`Server is running at http://${ip}:${port}`);
});