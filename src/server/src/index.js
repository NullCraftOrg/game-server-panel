const http = require('http');
const cors = require('cors');
const express = require('express');
const initWS = require('./ws');
const router = require('./route');
const config = require('./utils/config');
const log = require('./log');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

const server = http.createServer(app);

initWS(server);

const ip = config?.ip ?? 'localhost'
const port = config?.port ?? 6996

server.listen(port,ip, () => {

    log.raw('没有任何格式的信息');
    log.nullcraft('官方信息');
    log.debug('调试信息');
    log.info('普通信息');
    log.warn('警告信息');
    log.error('错误信息');

    log.raw('    _   _____________ ____ ');
    log.raw('   / | / / ____/ ___// __ \\');
    log.raw('  /  |/ / / __ \\__ \\/ /_/ /');
    log.raw(' / /|  / /_/ /___/ / ____/ ');
    log.raw('/_/ |_/\\____//____/_/      ');
    log.raw('');
    log.raw('==============================');
    log.raw('');

    log.info('后端服务于:', `http://${ip}:${port}/`);
})