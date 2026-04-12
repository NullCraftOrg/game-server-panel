import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import config from '../config.ts'
import { log } from '../log.ts'

let jwtSalt = config.get('jwt-salt')
if (jwtSalt === "YOUR_JWT_SALT_HERE" || jwtSalt.trim() === "") {
  jwtSalt = uuidv4()
  config.set('jwt-salt', jwtSalt)
  log.warn('未设置 JWT 加密盐值，已随机生成一个临时盐值，如需自定义可在 "\\data\\config.yml" 中设置 "jwt-salt" 为一个随机字符串以确保安全性。')
}

const JWT_SECRET = jwtSalt
const TOKEN_EXPIRES = config.get('token-expires') ?? '7d'
log.info(TOKEN_EXPIRES ? `Token 有效期设置为 ${TOKEN_EXPIRES}` : 'Token 有效期未设置，默认使用 7 天。')

/** 加密密码 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/** 验证密码 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

/** 生成Token */
export function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
}

/** 验证Token */
export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string }
  } catch {
    return null
  }
}