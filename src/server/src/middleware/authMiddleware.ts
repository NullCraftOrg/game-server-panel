import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../core/auth.ts'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // 将用户信息挂载到 req 上供后续使用
  (req as any).user = payload
  next()
}