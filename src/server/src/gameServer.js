const os = require('node:os');
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
        this.pid = null;

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

        console.log(`${this.name} - 启动进程: ${this.process.pid}`);
        
        this.pid = this.process.pid;

        this.process.onData((data) => {
            this.appendLog(data);
            this.isRunning = true;
        });

        this.process.onExit(({ exitCode, signal }) => {
            this.appendLog(`--- [进程退出: ${signal ?? 'Exit'}(${exitCode})] ---\r\n`);
            this.process = null;
            this.isRunning = false;
            console.log(`${this.name} - 进程退出: ${exitCode}, signal: ${signal}`);
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
