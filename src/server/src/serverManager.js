const GameServer = require('./gameServer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class ServerManager {
  constructor() {
    this.servers = new Map();
    this.file = path.join(__dirname, '../data/servers.json');
    this.load();
  }

  // 创建服务器
  create({ name, fileName, command, cwd }) {
    const id = uuidv4(); // UUID 防重复

    const server = new GameServer({
      id,
      name,
      fileName,
      command,
      cwd
    });

    this.servers.set(id, server);
    this.save();

    return server;
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
      isRunning: s.isRunning
    }));
  }

  // 保存服务器配置
  save() {
    const data = this.list();
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
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
      const { name, fileName, command, cwd, isRunning } = server;
      return { name, fileName, command, cwd, isRunning };
    }

    return;
  }
}

module.exports = new ServerManager();