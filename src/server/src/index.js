const http = require('http');
const cors = require('cors');
const express = require('express');
const initWS = require('./ws');
const router = require('./route');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

const server = http.createServer(app);

initWS(server);

server.listen(5678, () => {
    console.log('    _   _____________ ____ ');
    console.log('   / | / / ____/ ___// __ \\');
    console.log('  /  |/ / / __ \\__ \\/ /_/ /');
    console.log(' / /|  / /_/ /___/ / ____/ ');
    console.log('/_/ |_/\\____//____/_/      ');
    console.log('');
    console.log('==============================');
    console.log('');
    console.log('后端服务于: http://localhost:5678');
})