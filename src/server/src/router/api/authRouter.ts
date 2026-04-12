import { Router } from 'express';
import { DBUsers } from '../../db.ts'
import { authMiddleware } from '../../middleware/authMiddleware.ts'
import { comparePassword, generateToken } from '../../core/auth.ts'
import { log } from '../../log.ts'

// BASE URL /api/auth
const authRouter = Router()

/** 通过JWT的token获取用户信息 */
authRouter.get('/me', authMiddleware, async (req, res) => {
  const user = DBUsers.getUserById((req as any).user.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ id: user.id, email: user.email, username: user.username, role: user.role })
})

/** 注册 */
authRouter.post('/register', async (req, res) => {
  // 解构需要的字段
  const { email, username, password } = req.body

  // 非空校验
  if (!email || !username || !password) {
    return res.status(400).json({ error: '电子邮箱、用户名和密码为必填项' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度必须在6个字符以上' })
  }

  // 仅允许字母和数字，最小 2 位，最大 32 位
  const usernameRegex = /^[a-zA-Z0-9]{2,32}$/
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: '用户名只能包含字母和数字且长度必须在2到32个字符之间' })
  }

  // 邮箱格式简单校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '错误的电子邮箱格式' })
  }

  // 用户名唯一校验
  const existing = DBUsers.getUserByUsername(username)
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' })
  }

  // 检查是否首个用户 -> 设为 admin
  const userCount = DBUsers.getCount();
  const role = userCount === 0 ? 'admin' : 'user'

  // 添加用户
  const resultUserId = DBUsers.addUser(email, username, password, role)

  // 生成 token
  const token = generateToken(resultUserId, role)

  log.info('用户注册', '注册邮箱', email, '注册用户名', username, '角色', role, '用户自增ID', resultUserId)

  // 返回 token 和用户信息（不包含密码）
  res.json({ token, user: { id: resultUserId, email: email, username: username, role: role } })
})

/** 登录 */
authRouter.post('/login', async (req, res) => {
  // 解构需要的字段
  // 登录支持用户名或邮箱登录共用 authData 字段
  const { authData, password } = req.body

  if (!authData || !password) {
    return res.status(400).json({ error: '登录信息不完整' })
  }

  // 获取用户信息
  const user = DBUsers.getUserByEmailOrUsername(authData)
  if (!user || !user.password || !comparePassword(password, user.password)) {
    log.warn('用户登录失败', '尝试登录Email/用户名', authData)
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // 生成 token
  const token = generateToken(user.id, user.role)

  log.debug('用户登录', '登录Email/用户名', authData, '角色', user.role, '用户ID', user.id)

  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } })
})

export default authRouter;