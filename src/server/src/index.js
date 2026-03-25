const express = require('express');
const http = require('http');
const cors = require('cors');
const router = require('./route');
const initWS = require('./ws');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

const server = http.createServer(app);

initWS(server);

server.listen(5678, () => {
    console.log('server: http://localhost:5678');
})
