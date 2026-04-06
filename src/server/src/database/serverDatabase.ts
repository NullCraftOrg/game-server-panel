import { DatabaseSync } from 'node:sqlite';
import { log } from '../log.ts';
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts';

// 日志前缀
const LOG_PREFIX = '[Database(Servers)]';

export interface ServerRecord extends ServerConfigInterface {
    id?: number;    // 自增主键(内部用)
}

export class ServerDatabase {
    private dbPath: string
    private db: DatabaseSync
    private dbInstance: DatabaseSync | null = null

    constructor(dbPath: string) {
        this.dbPath = dbPath
        this.db = this.getDB()
        this.dbInstance = null
        this.initTable()
    }

    private getDB(): DatabaseSync {
        if (!this.dbInstance) {
            this.dbInstance = new DatabaseSync(this.dbPath);
            // 外键约束
            this.dbInstance.exec('PRAGMA foreign_keys = ON;');
            // 设置 journal 模式为 WAL 提高并发性能
            this.dbInstance.exec('PRAGMA journal_mode = WAL;');
        }
        return this.dbInstance;
    }

    /**
     * 初始化 servers 表（如果不存在则创建）
     */
    private initTable(): void {
        const createTableSQL = `
                CREATE TABLE IF NOT EXISTS servers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    fileName TEXT NOT NULL,
                    command TEXT,
                    cwd TEXT,
                    forceUtf8Mode INTEGER DEFAULT 0,
                    usePty INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_uuid ON servers(uuid);
            `;
        this.db.exec(createTableSQL);

        // 更新先前部署而未被新增的列
        this.ensureColumn('servers', 'usePty', 'INTEGER DEFAULT 1');

        log.debug(LOG_PREFIX, '表已就绪');
    }

    /**
     * 确保表中存在指定列，若不存在则自动添加
     * @param tableName 表名
     * @param columnName 列名
     * @param columnDefinition 列定义（如 "INTEGER DEFAULT 1"）
     */
    private ensureColumn(tableName: string, columnName: string, columnDefinition: string): void {
        // 查询表结构
        const checkSQL = `PRAGMA table_info(${tableName})`;
        const columns = this.db.prepare(checkSQL).all() as Array<{ name: string }>;
        const exists = columns.some(col => col.name === columnName);

        if (!exists) {
            const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`;
            this.db.exec(alterSQL);
            log.debug(LOG_PREFIX, `已为表 ${tableName} 添加列 ${columnName}，定义：${columnDefinition}`);
        }
    }

    /**
     * 新增服务器记录
     * @param data 服务器数据（不含自增 id）
     * @returns 插入行的自增 id
     */
    add(data: Omit<ServerRecord, 'id'>): number {
        const { uuid, name, fileName, command, cwd, forceUtf8Mode, usePty } = data;
        const stmt = this.db.prepare(`
                INSERT INTO servers (uuid, name, fileName, command, cwd, forceUtf8Mode, usePty)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
        const info = stmt.run(uuid, name, fileName, command, cwd, forceUtf8Mode ? 1 : 0, usePty ? 1 : 0);
        log.debug(LOG_PREFIX, '新增服务器', `${name}(${uuid}), 自增ID=${info.lastInsertRowid}`);
        return Number(info.lastInsertRowid);
    }

    /**
     * 通过 uuid 查询服务器记录
     * @param uuid UUID
     * @returns 服务器记录或 undefined
     */
    get(uuid: string): ServerRecord | undefined {
        const stmt = this.db.prepare(`
            SELECT id, uuid, name, fileName, command, cwd, forceUtf8Mode, usePty
            FROM servers
            WHERE uuid = ?
        `);
        const row = stmt.get(uuid) as any;
        if (!row) return undefined;
        return {
            id: row.id,
            uuid: row.uuid,
            name: row.name,
            fileName: row.fileName,
            command: row.command,
            cwd: row.cwd,
            forceUtf8Mode: row.forceUtf8Mode === 1,
            usePty: row.usePty === 1,
        };
    }

    /**
    * 通过 uuid 更新服务器记录
    * @param uuid UUID
    * @param updates 需要更新的字段
    * @returns 是否更新成功（影响行数 > 0）
    */
    update(uuid: string, updates: Partial<Omit<ServerRecord, 'id' | 'uuid'>>): boolean {
        // 动态构建 SET 子句
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.fileName !== undefined) {
            fields.push('fileName = ?');
            values.push(updates.fileName);
        }
        if (updates.command !== undefined) {
            fields.push('command = ?');
            values.push(updates.command);
        }
        if (updates.cwd !== undefined) {
            fields.push('cwd = ?');
            values.push(updates.cwd);
        }
        if (updates.forceUtf8Mode !== undefined) {
            fields.push('forceUtf8Mode = ?');
            values.push(updates.forceUtf8Mode ? 1 : 0);
        }
        if (updates.usePty !== undefined) {
            fields.push('usePty = ?');
            values.push(updates.usePty ? 1 : 0);
        }

        if (fields.length === 0) {
            log.warn(LOG_PREFIX, '发起更新', uuid, '但没有提供任何字段', '更新失败');
            return false;
        }

        // 自动更新 updated_at 时间戳
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(uuid); // WHERE 条件参数

        const sql = `UPDATE servers SET ${fields.join(', ')} WHERE uuid = ?`;
        const stmt = this.db.prepare(sql);
        const info = stmt.run(...values);
        const success = info.changes > 0;
        if (success) {
            log.debug(LOG_PREFIX, '更新', uuid, '成功');
        } else {
            log.warn(LOG_PREFIX, '未找到', uuid, '更新失败');
        }
        return success;
    }

    /**
     * 通过 uuid 删除服务器记录
     * @param uuid UUID
     * @returns 是否删除成功（影响行数 > 0）
     */
    delete(uuid: string): boolean {
        const stmt = this.db.prepare('DELETE FROM servers WHERE uuid = ?');
        const info = stmt.run(uuid);
        const success = info.changes > 0;
        if (success) {
            log.debug(LOG_PREFIX, '删除服务器', uuid, '成功');
        } else {
            log.warn(LOG_PREFIX, '未找到', uuid, '记录', '删除失败');
        }
        return success;
    }

    /**
     * 获取所有服务器列表
     */
    getAll(): ServerRecord[] {
        const stmt = this.db.prepare(`
            SELECT id, uuid, name, fileName, command, cwd, forceUtf8Mode, usePty
            FROM servers
            ORDER BY id
        `);
        const rows = stmt.all() as any[];
        return rows.map(row => ({
            id: row.id,
            uuid: row.uuid,
            name: row.name,
            fileName: row.fileName,
            command: row.command,
            cwd: row.cwd,
            forceUtf8Mode: row.forceUtf8Mode === 1,
            usePty: row.usePty === 1,
        }));
    }

    /**
         * 关闭数据库连接（应用退出时调用）
         */
    close(): void {
        if (this.dbInstance) {
            this.dbInstance.close();
            this.dbInstance = null;
            log.debug(LOG_PREFIX, '数据库连接已关闭');
        }
    }
}