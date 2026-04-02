import http from 'http'
import cors from 'cors'
import express from 'express'
// 全局路径
import {PATHS, __dirname, __filename} from './utils/paths.ts'
// ws
import InitWebSocket from './core/ws.ts'
// routers
import router from './router/indexRouter.ts'
// config
import config from './utils/config.ts'

console.log('通过 \'/utils/paths.ts\' 配置的全局路径列表:')
console.log('PATHS:',PATHS)
console.log('__dirname:',__dirname)
console.log('__filename:', __filename)

const app = express();
const server = http.createServer(app);

InitWebSocket(server);

app.use(cors());
app.use(express.json());
app.use("/", router);

const ip = config.ip ?? "localhost";
const port = config.port ?? 9119;

server.listen(port, ip, () => {
  console.log(`Server is running at http://${ip}:${port}`);
});
