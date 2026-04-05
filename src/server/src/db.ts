import path from 'node:path';
import { PATHS } from './utils/paths.ts';
import { ServerDatabase } from './database/serverDatabase.ts';

// 数据库文件路径
const DB_PATH = path.join(PATHS.data, 'panel.db');

// 初始化Servers表数据库
const DBServers = new ServerDatabase(DB_PATH)

export { DB_PATH, DBServers }