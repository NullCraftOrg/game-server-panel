// 一个简单的热重载系统，用于开发阶段文本变动自动重启服务器
import { spawn, ChildProcess } from 'node:child_process'
import { watch } from 'node:fs'
import { resolve } from 'node:path'
import { log } from './log.ts'

let child: ChildProcess | null = null;
let restarting = false;

const entry = resolve("./src/index.ts");

function start() {
  if (restarting) return;
  restarting = true;

  if (child) {
    log.warn('[DEV]', "清理老进程...");
    child.kill("SIGKILL"); // Windows + node-pty 推荐直接强杀不然会异常
    child = null;
  }

  log.info('[DEV]', "正在启动新进程...");

  child = spawn(process.execPath, [entry], {
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    log.warn('[DEV]', `线程退出: ${code}`);
  });

  restarting = false;
}

start();

let timer: NodeJS.Timeout | null = null;

watch(".", { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  // 过滤
  if (
    !filename.endsWith(".ts") ||
    filename.includes("node_modules") ||
    filename.includes(".git")
  ) return;
  
  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    log.info('[DEV]', `触发重载: ${filename}`);
    start();
  }, 300);
});