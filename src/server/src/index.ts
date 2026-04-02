import http from 'http'
import cors from 'cors'
import express from 'express'
// 全局路径
import { PATHS, __dirname, __filename } from './utils/paths.ts'
// ws
import InitWebSocket from './core/ws.ts'
// routers
import router from './router/indexRouter.ts'
// config
import config from './utils/config.ts'
// 日志系统
import { log } from './log.ts'

// 临时Debug信息
console.log('============== DEBUG START ===============');
console.log('通过 \'/utils/paths.ts\' 配置的全局路径列表:')
console.log('PATHS:', PATHS)
console.log('__dirname:', __dirname)
console.log('__filename:', __filename)
console.log('=============== DEBUG END ===============\n');

const app = express();
const server = http.createServer(app);

InitWebSocket(server);

app.use(cors());
app.use(express.json());
app.use("/", router);

const ip = config.ip ?? "localhost";
const port = config.port ?? 9119;

server.listen(port, ip, () => {
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

  log.info('后端服务于:', `http://${ip}:${port}/`);
});
