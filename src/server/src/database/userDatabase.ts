import { DatabaseSync } from 'node:sqlite'
import { log } from '../log.ts'
import { hashPassword } from '../core/auth.ts'
import type { UserInterface } from '../interface/UserInterface.ts'

// 表名
const TABLE_NAME = 'users'
// 日志前缀
const LOG_PREFIX = '[Database(Users)]'

export class UserDatabase {
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
        this.getDB().exec(createTableSQL);

        log.debug(LOG_PREFIX, '表已就绪', `共计 ${this.getCount()} 条记录`);
    }

    /** 获取表记录数 */
    getCount(): number {
        const tablecount = this.getDB().prepare(`SELECT COUNT(*) AS count FROM ${TABLE_NAME}`).all() as Array<{ count: number }>
        return tablecount[0]?.count ?? 0
    }

    /** 列出所有用户(不含密码) */
    listUsers(): Array<UserInterface> {
        const stmt = this.getDB().prepare(`SELECT id, email, username, role FROM ${TABLE_NAME} ORDER BY created_at ASC`)
        const rows = stmt.all() as Array<{ id: number, email: string, username: string, role: string }>
        return rows
    }

    /** 通过用户名或Email获取与用户信息(含加密后密码) */
    getUserByEmailOrUsername(authData: string): UserInterface | undefined {
        const stmt = this.getDB().prepare(`SELECT id, email, username, password, role FROM ${TABLE_NAME} WHERE email = ? OR username = ?`)
        const row = stmt.get(authData, authData) as UserInterface | undefined
        if (!row) return undefined
        return row
    }

    /**
     * 通过用户ID获取用户信息（包含密码哈希，注意对外提供移除密码!）
     * @param id 
     * @returns 包含密码哈希，注意对外提供移除密码!
     */
    getUserById(id: number): UserInterface | undefined {
        const stmt = this.getDB().prepare(`SELECT id, email, username, password, role FROM ${TABLE_NAME} WHERE id = ?`)
        const row = stmt.get(id) as UserInterface | undefined
        if (!row) return undefined

        return row
    }

    /**
     * 通过用户名获取用户信息（包含密码哈希，注意对外提供移除密码!）
     * @param username 
     * @returns 包含密码哈希，注意对外提供移除密码!
     */
    getUserByUsername(username: string): UserInterface | undefined {
        const stmt = this.getDB().prepare(`SELECT id, email, username, password, role FROM ${TABLE_NAME} WHERE username = ?`)
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
        const insert = this.getDB().prepare(`INSERT INTO ${TABLE_NAME} (email, username, password, role) VALUES (?, ?, ?, ?)`)
        const hashedPassword = hashPassword(password)
        const result = insert.run(email, username, hashedPassword, role)
        if (result.changes === 1) {
            return result.lastInsertRowid as number
        } else {
            throw new Error('Failed to insert user')
        }
    }

    updateUser(id: number, updates: Partial<Omit<UserInterface, 'id' | 'created_at' | 'updated_at'>>): boolean {
        const fields = Object.keys(updates) as Array<keyof typeof updates>
        if (fields.length === 0) {
            throw new Error('至少需要提供一个要更新的字段')
        }

        // 动态构建 SET 子句
        const setClauses: string[] = []
        const values: any[] = []
        for (const field of fields) {
            const value = updates[field]
            if (value !== undefined) {
                if (field === 'password') {
                    // 密码字段特殊处理：自动哈希
                    setClauses.push(`${field} = ?`)
                    values.push(hashPassword(value))
                } else {
                    setClauses.push(`${field} = ?`)
                    values.push(value)
                }
            }
        }
        // 手动更新 updated_at 时间戳（若未使用触发器）
        setClauses.push(`updated_at = CURRENT_TIMESTAMP`)

        // 构建完整 SQL
        const sql = `
            UPDATE ${TABLE_NAME}
            SET ${setClauses.join(', ')}
            WHERE id = ?
        `
        values.push(id)
        const stmt = this.getDB().prepare(sql)
        const result = stmt.run(...values)

        if (result.changes === 0) {
            log.warn(LOG_PREFIX, `更新用户失败，ID ${id} 不存在或无变更`)
            return false
        }

        log.debug(LOG_PREFIX, `用户 ID ${id} 信息已更新`)
        return true
    }

    /** 删除用户 */
    deleteUser(id: number): boolean {
        const stmt = this.getDB().prepare(`DELETE FROM ${TABLE_NAME} WHERE id = ?`);
        const info = stmt.run(id);
        const success = info.changes > 0;
        if (success) {
            log.debug(LOG_PREFIX, '删除用户', id, '成功');
        } else {
            log.warn(LOG_PREFIX, '未找到', id.toString(), '记录', '删除失败');
        }
        return success;
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