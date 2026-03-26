const os = require('node:os');
// const { spawn } = require('node-pty');
const pty = require("node-pty");
const path = require('path');
const fs = require('fs');

class GameServer {
    constructor({ id, name, fileName, command, cwd }) {
        this.id = id;
        this.name = name;
        this.fileName = fileName
        this.command = command;
        this.cwd = cwd;
        this.process = null;
        this.clients = new Set();
        this.isRunning = false;

        // 日志
        this.logBuffer = [];
        this.maxLines = 10000;

        // this.logFile = path.join(__dirname, `../data/logs/${id}.log`);
        // fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }

    start() {
        if (this.process) return;

        this.process = pty.spawn(this.fileName, this.command, {
            name: 'xterm-256color',
            rows: 10000,
            cols: 10000,
            cwd: this.cwd,
            windowsHide: true,
            env: {
                ...process.env,
                // 关键：设置 UTF-8 编码环境
                LANG: "en_US.UTF-8"
            }
        });

        this.process.onData((data) => {
            this.appendLog(data);
            this.isRunning = true;
        });

        this.process.onExit(() => {
            this.appendLog('--- [进程退出] ---\r\n');
            this.process = null;
            this.isRunning = false;
        });
    }

    stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }

    sendCommand(cmd) {
        if (this.process) {
            this.process.write(cmd);
        }
    }

    broadcast(msg) {
        for (const ws of this.clients) {
            if (ws.readyState === 1) {
                ws.send(msg);
            }
        }
    }

    appendLog(text) {

        this.logBuffer.push(text);

        if (this.logBuffer.length > this.maxLines) {
            this.logBuffer.shift();
        }

        // 写文件
        // fs.appendFile(this.logFile, text, () => { });

        // 推送
        this.broadcast(text);
    }

}

module.exports = GameServer;
