import { DatabaseSync } from 'node:sqlite'
import { log } from '../log.ts'
import type { ServerConfigInterface } from '../interface/ServerConfigInterface.ts'
import { ensureColumn } from './dbHelper.ts'

// 表名
const TABLE_NAME = 'servers'
// 日志前缀
const LOG_PREFIX = '[Database(Servers)]'

export interface ServerRecord extends ServerConfigInterface {
    id?: number;    // 自增主键(内部用)
}

export class ServerDatabase {
    private dbPath: string
    private db: DatabaseSync | null = null

    constructor(dbPath: string) {
        this.dbPath = dbPath
        this.initConnection()  // 建立连接
        this.initTable()
    }

    /**
     * 建立数据库连接（仅内部调用）
     */
    private initConnection(): void {
        if (this.db) return  // 防止重复初始化
        this.db = new DatabaseSync(this.dbPath)
        // 外键约束
        this.db.exec('PRAGMA foreign_keys = ON;')
        this.db.exec('PRAGMA journal_mode = WAL;')
    }

    /**
     * 获取数据库实例（内部使用，保证调用时一定非空）
     */
    private getDB(): DatabaseSync {
        if (!this.db) {
            throw new Error(`数据库连接已关闭或未初始化，请重新创建 ${LOG_PREFIX} 实例。`)
        }
        return this.db
    }

    /**
     * 初始化 servers 表（如果不存在则创建）
     */
    private initTable(): void {
        const createTableSQL = `
                CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
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
        this.getDB().exec(createTableSQL);

        // 更新先前部署而未被新增的列
        ensureColumn(this.getDB(), 'servers', 'usePty', 'INTEGER DEFAULT 1');

        log.debug(LOG_PREFIX, '表已就绪', `共计 ${this.getCount()} 条记录`);
    }

    getCount() {
        const tablecount = this.getDB().prepare(`SELECT COUNT(*) AS count FROM ${TABLE_NAME}`).all() as Array<{ count: number }>
        return tablecount[0]?.count ?? 0
    }

    /**
     * 新增服务器记录
     * @param data 服务器数据（不含自增 id）
     * @returns 插入行的自增 id
     */
    add(data: Omit<ServerRecord, 'id'>): number {
        const { uuid, name, fileName, command, cwd, forceUtf8Mode, usePty } = data;
        const stmt = this.getDB().prepare(`
                INSERT INTO ${TABLE_NAME} (uuid, name, fileName, command, cwd, forceUtf8Mode, usePty)
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
        const stmt = this.getDB().prepare(`
            SELECT id, uuid, name, fileName, command, cwd, forceUtf8Mode, usePty
            FROM ${TABLE_NAME}
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

        const sql = `UPDATE ${TABLE_NAME} SET ${fields.join(', ')} WHERE uuid = ?`;
        const stmt = this.getDB().prepare(sql);
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
        const stmt = this.getDB().prepare(`DELETE FROM ${TABLE_NAME} WHERE uuid = ?`);
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
        const stmt = this.getDB().prepare(`
            SELECT id, uuid, name, fileName, command, cwd, forceUtf8Mode, usePty
            FROM ${TABLE_NAME}
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
        if (this.db) {
            this.db.close()
            this.db = null
            log.debug(LOG_PREFIX, '数据库连接已关闭')
        }
    }
}