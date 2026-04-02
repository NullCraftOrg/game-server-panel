const GameServer = require('./gameServer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const log = require('./log');

class ServerManager {
  constructor() {
    this.servers = new Map();
    this.file = path.join(__dirname, '../data/servers.json');
    this.load();
  }

  // 创建服务器 - 只写确定永久文件化保存的内容。
  create({ name, fileName, command, cwd, forceUtf8Mode }) {
    const id = uuidv4(); // UUID 防重复

    const server = new GameServer({
      id,
      name,
      fileName,
      command,
      cwd,
      forceUtf8Mode,
    });

    this.servers.set(id, server);
    this.save();

    log.info('创建服务器配置:', server.id);

    return server;
  }

  // 更新服务器
  update(id, { name, fileName, command, cwd, forceUtf8Mode }) {
    const server = this.servers.get(id);
    if (!server) return;
    // 单独控制需要更新的内容，以防出现问题。
    server.name = name;
    server.fileName = fileName;
    server.command = command;
    server.cwd = cwd;
    server.forceUtf8Mode = forceUtf8Mode;

    this.save();

    log.info('更新服务器配置:', id, forceUtf8Mode);

    return server;
  }

  // 删除服务器
  delete(id){
    this.servers.delete(id);
    this.save();

    log.warn('删除服务器配置:', id);

    return id;
  }

  // 获取指定服务器
  get(id) {
    return this.servers.get(id);
  }

  // 获取全部服务器
  list() {
    return Array.from(this.servers.values()).map(s => ({
      id: s.id,
      name: s.name,
      fileName: s.fileName,
      command: s.command,
      cwd: s.cwd,
      forceUtf8Mode: s.forceUtf8Mode,
      isRunning: s.isRunning // 用于内存中读取状态，save() 时会被剔除。
    }));
  }

  // 保存服务器配置
  save() {
    // 获取全部服务器
    const servers = this.list();
    // 剔除不需要永久化文件保存的值：isRunning
    const clearServers = servers.map(({ isRunning, ...rest }) => rest);
    fs.writeFileSync(this.file, JSON.stringify(clearServers, null, 2));
  }

  // 加载服务器配置文件
  load() {
    if (!fs.existsSync(this.file)) return;

    const data = JSON.parse(fs.readFileSync(this.file));
    for (const item of data) {
      const server = new GameServer(item);
      this.servers.set(item.id, server);
    }
  }

  // 获取服务器状态信息
  info(id){
    const server = this.servers.get(id);

    if(server){
      const { name, fileName, command, cwd, isRunning, forceUtf8Mode } = server;
      return { name, fileName, command, cwd, isRunning, forceUtf8Mode };
    }

    return;
  }
}

module.exports = new ServerManager();