// 用于代替 es __dirname __filename 使用。
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 当文件路径
 */
export const __filename = fileURLToPath(import.meta.url)

/**
 * 当文件目录
 */
export const __dirname = path.dirname(__filename)

/**
 * 项目根目录
 */
export const ROOT = path.resolve(process.cwd())

/**
 * 从根目录拼接完整路径
 * @param paths 路径片段
 * @returns 拼接后的完整路径
 */
export function resolvePath(...paths: string[]): string{
    return path.resolve(ROOT, ...paths)
}

/**
 * 从文件相对路径拼接
 * @param paths 路径片段
 * @returns 拼接后的完整路径
 */
export function resolveFromHere(...paths: string[]): string{
     return path.resolve(__dirname, ...paths)
}

// 定义常用路径
export const PATHS = {
    root: ROOT,
    src: resolvePath('src'),
    data: resolvePath('data'),
    logs: resolvePath('logs'),
}