const os = require('os');
const pty = require("node-pty");
const log = require('./log');

class GameServer {
    // 只写确定永久化文件保存的内容。
    constructor({ id, name, fileName, command, cwd, forceUtf8Mode }) {
        this.id = id;
        this.name = name;
        this.fileName = fileName
        this.command = command;
        this.cwd = cwd;
        this.forceUtf8Mode = forceUtf8Mode;

        this.process = null;
        this.clients = new Set();
        this.isRunning = false;
        this.pid = null;

        // 缓存日志
        this.logBuffer = [];
        this.maxLines = 10000;

        // 文件日志
        // this.logFile = path.join(__dirname, `../data/logs/${id}.log`);
        // fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }

    start() {
        if (this.process) return;

        // 当启用 config 中的 force-win-chcp-65001 时并且为 Windows 环境下
        // 使用 cmd + chcp 设置 UTF-8 编码，避免乱码问题
        const isWin = os.platform() === 'win32';

        if (this.forceUtf8Mode && isWin) {

            const forceChcpMode = "当前使用强兼UTF-8模式(config.yml -> force-win-chcp-65001)启动服务器。"
            log.warn(forceChcpMode);

            const shell = 'cmd.exe';

            const chcpArgs = [
                '/d',
                '/s',
                '/c',
                `echo "${forceChcpMode}"`,
                '&',
                'chcp 65001>nul',
                '&',
                'cls',
                '&',
                `"${this.fileName}"`,
                `${this.command}`
            ];

            this.process = pty.spawn(shell, chcpArgs.join(' '), {
                name: 'xterm-256color',
                rows: this.maxLines,
                cols: this.maxLines,
                cwd: this.cwd,
                windowsHide: true,
            });
        }
        else {
            // 正常方式
            this.process = pty.spawn(this.fileName, this.command, {
                name: 'xterm-256color',
                rows: this.maxLines,
                cols: this.maxLines,
                cwd: this.cwd,
                windowsHide: true,
            });
        }

        // 进程启动成功后，记录 PID 和状态，并发送日志消息
        if (this.process.pid) {
            this.pid = this.process.pid;
            this.isRunning = true;

            const startMsg = ['启动进程:', this.name, 'PID:', this.process.pid].join(' ');
            this.appendLog(startMsg + '\r\n');
            log.info(startMsg);
        }
        this.process.on

        // 将进程输出通过 WebSocket 广播给所有客户端，并缓存日志
        this.process.onData((data) => {
            this.appendLog(data);
        });

        // 监听进程退出事件，更新状态并发送日志消息
        this.process.onExit(({ exitCode, signal }) => {
            this.process = null;
            this.isRunning = false;

            const exitMsg = ['进程退出:', this.name, 'ExitCode:', exitCode ?? -1, 'Signal:', signal ?? 'Exit'].join(' ');
            this.appendLog(exitMsg + '\r\n');
            log.info(exitMsg);
        });
    }

    // 停止进程
    stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }

    // 发送命令
    sendCommand(cmd) {
        if (this.process) {
            this.process.write(cmd);
        }
    }

    // 追加日志并广播
    appendLog(text) {
        this.logBuffer.push(text);

        if (this.logBuffer.length > this.maxLines) {
            this.logBuffer.shift();
        }

        // 写文件日志
        // fs.appendFile(this.logFile, text, () => { });

        // 推送
        this.broadcast(text);
    }

    // 广播消息给所有客户端
    broadcast(msg) {
        for (const ws of this.clients) {
            if (ws.readyState === 1) {
                ws.send(msg);
            }
        }
    }
}

module.exports = GameServer;
