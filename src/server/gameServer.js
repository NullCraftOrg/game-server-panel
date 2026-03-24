const os = require('node:os');
const { spawn } = require('node-pty');
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

        // 日志偏移
        this.offset = 0;
        // ✅ 日志
        this.logBuffer = [];
        this.maxLines = 10000;

        this.logFile = path.join(__dirname, `../data/logs/${id}.log`);
        fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }

    start() {
        if (this.process) return;

        const shell = os.platform() === 'win32' ? 'PowerShell.exe' : 'bash';

        this.process = spawn(shell, [this.fileName, this.command], {
            name: 'xterm-color',
            rows: 1000,
            cols: 1000,
            cwd:this.cwd,
            env: process.env,
        });

        this.process.onData((data) => {
            this.appendLog(data);
        });

        this.process.onExit(() => {
            this.appendLog('\r\n--- [进程退出] ---\r\n');
            this.process = null;
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
        this.offset += text.length;

        this.logBuffer.push({
            offset: this.offset,
            text
        });

        if (this.logBuffer.length > this.maxLines) {
            this.logBuffer.shift();
        }

        // 写文件
        fs.appendFile(this.logFile, text, () => { });

        // 推送
        this.broadcast(JSON.stringify({
            offset: this.offset,
            text
        }));
    }
}

module.exports = GameServer;
