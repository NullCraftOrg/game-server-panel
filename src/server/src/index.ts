// 日志系统
import { log } from './log.ts'
log.none('没有任何格式的信息');
log.nullcraft('官方信息');
log.debug('调试信息');
log.info('普通信息');
log.warn('警告信息');
log.error('错误信息');

log.none('    _   _____________ ____ ');
log.none('   / | / / ____/ ___// __ \\');
log.none('  /  |/ / / __ \\__ \\/ /_/ /');
log.none(' / /|  / /_/ /___/ / ____/ ');
log.none('/_/ |_/\\____//____/_/      ');
log.none('');
log.none('==============================');
log.none('');

// config
import config from './config.ts'
// 模块
import http from 'http'
import cors from 'cors'
import express from 'express'
// ws
import InitWebSocket from './core/ws.ts'
// routers
import router from './router/indexRouter.ts'

const app = express();
const server = http.createServer(app);
InitWebSocket(server);

app.use(cors());
app.use(express.json());
app.use("/", router);

const ip = config.ip ?? "localhost";
const port = config.port ?? 9119;

server.listen(port, ip, () => {
  log.info('[WebSocket]', 'WebSocket', '服务于:', `ws://${ip}:${port}/`)
  log.info('[Main]', '后端API服务于:', `http://${ip}:${port}/`);
});
