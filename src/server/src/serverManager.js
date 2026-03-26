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

  create({ name, fileName, command, cwd }) {
    const id = uuidv4(); // ✅ UUID 防重复

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

  get(id) {
    return this.servers.get(id);
  }

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

  save() {
    const data = this.list();
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
  }

  load() {
    if (!fs.existsSync(this.file)) return;

    const data = JSON.parse(fs.readFileSync(this.file));
    for (const item of data) {
      const server = new GameServer(item);
      this.servers.set(item.id, server);
    }
  }
}

module.exports = new ServerManager();