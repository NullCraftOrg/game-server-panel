import { DatabaseSync } from 'node:sqlite'
import { log } from '../log.ts'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword, comparePassword, generateToken } from '../auth.ts'

// 表名
const TABLE_NAME = 'users'
// 日志前缀
const LOG_PREFIX = '[Database(Users)]'

export class UserDatabase {
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
     * 初始化 users 表（如果不存在则创建）
     */
    private initTable(): void {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        this.db.exec(createTableSQL);
        
        log.debug(LOG_PREFIX, '表已就绪', `共计 ${this.getCount()} 条记录`);
    }

    getCount() {
        const tablecount = this.db.prepare(`SELECT COUNT(*) AS count FROM ${TABLE_NAME}`).all() as Array<{ count: number }>
        return tablecount[0].count
    }

    getUserById(id: string){
        const stmt = this.db.prepare(`SELECT id, username, password, role FROM users WHERE id = ?`)
        const row = stmt.get(id) as any;
        if (!row) return undefined;

        return row
    }

    getUser(username: string) {
        const stmt = this.db.prepare(`SELECT id, username, password, role FROM users WHERE username = ?`)
        const row = stmt.get(username) as any;
        if (!row) return undefined;

        return row
    }

    addUser(username: string, password: string, role: string) {
        const insert = this.db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)')
        const userId = uuidv4()
        const hashedPassword = hashPassword(password)
        const result = insert.run(userId, username, hashedPassword, role)
        if (result.changes === 1) {
            return { id: userId, username, role }
        } else {
            throw new Error('Failed to insert user')
        }
    }
}