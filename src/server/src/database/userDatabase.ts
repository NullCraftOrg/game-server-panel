import { DatabaseSync } from 'node:sqlite'
import { log } from '../log.ts'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '../core/auth.ts'
import type { UserInterface } from '../interface/UserInterface.ts'

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
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        this.db.exec(createTableSQL);
        
        log.debug(LOG_PREFIX, '表已就绪', `共计 ${this.getCount()} 条记录`);
    }

    getCount(): number {
        const tablecount = this.db.prepare(`SELECT COUNT(*) AS count FROM ${TABLE_NAME}`).all() as Array<{ count: number }>
        return tablecount[0].count
    }

    listUsers(): Array<UserInterface> {
        const stmt = this.db.prepare(`SELECT id, email, username, role FROM ${TABLE_NAME} ORDER BY created_at ASC`)
        const rows = stmt.all() as Array<{ id: number, email: string, username: string, role: string }>
        return rows
    }

    getUserByEmailOrUsername(authData: string): UserInterface | undefined {
        const stmt = this.db.prepare(`SELECT id, email, username, password, role FROM ${TABLE_NAME} WHERE email = ? OR username = ?`)
        const row = stmt.get(authData, authData) as UserInterface | undefined
        if (!row) return undefined
        return row
    }

    /**
     * 通过用户ID获取用户信息（包含密码哈希，注意对外提供移除密码!）
     * @param id 
     * @returns 
     */
    getUserById(id: number): UserInterface | undefined {
        const stmt = this.db.prepare(`SELECT id, email, username, password, role FROM users WHERE id = ?`)
        const row = stmt.get(id) as UserInterface | undefined
        if (!row) return undefined

        return row
    }

    /**
     * 通过用户名获取用户信息（包含密码哈希，注意对外提供移除密码!）
     * @param username 
     * @returns 
     */
    getUserByUsername(username: string): UserInterface | undefined {
        const stmt = this.db.prepare(`SELECT id, email, username, password, role FROM users WHERE username = ?`)
        const row = stmt.get(username) as UserInterface | undefined
        if (!row) return undefined

        return row
    }

    /**
     * 添加新用户(密码会自动加密，请勿传入已加密的密码)
     * @param username 用户名
     * @param password 密码(未加密状态)
     * @param role (角色)
     * @returns 
     */
    addUser(email: string, username: string, password: string, role: string): number {
        const insert = this.db.prepare('INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)')
        const hashedPassword = hashPassword(password)
        const result = insert.run(email, username, hashedPassword, role)
        if (result.changes === 1) {
            return result.lastInsertRowid as number
        } else {
            throw new Error('Failed to insert user')
        }
    }
}