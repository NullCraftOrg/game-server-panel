    import { DatabaseSync } from 'node:sqlite'
    import { log } from '../log.ts'

    /**
     * 确保表中存在指定列，若不存在则自动添加
     * @param tableName 表名
     * @param columnName 列名
     * @param columnDefinition 列定义（如 "INTEGER DEFAULT 1"）
     */
    export function ensureColumn(db: DatabaseSync ,tableName: string, columnName: string, columnDefinition: string): void {
        // 查询表结构
        const checkSQL = `PRAGMA table_info(${tableName})`;
        const columns = db.prepare(checkSQL).all() as Array<{ name: string }>;
        const exists = columns.some(col => col.name === columnName);

        if (!exists) {
            const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`;
            db.exec(alterSQL);
            log.debug('dbHelper.ensureColumn()', `已为表 ${tableName} 添加列 ${columnName}，定义：${columnDefinition}`);
        }
    }