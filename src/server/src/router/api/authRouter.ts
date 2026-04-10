import { Router } from 'express';
import { DBUsers } from '../../db.ts'
import { comparePassword, generateToken } from '../../core/auth.ts'
import { log } from '../../log.ts';

const authRouter = Router();

// 注册
authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const existing = DBUsers.getUserByUsername(username)
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' })
  }

  // 检查是否首个用户 -> 设为 admin
  const userCount = DBUsers.getCount();
  const role = userCount === 0 ? 'admin' : 'user'

  const resultUser = DBUsers.addUser(username, password, role)

  const token = generateToken(resultUser.id, resultUser.role)

  log.info('用户注册', '注册用户名', username, '角色', role, '用户ID', resultUser.id)

  res.json({ token, user: { id: resultUser.id, username: resultUser.username, role: resultUser.role } })
});

// 登录
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const user = DBUsers.getUserByUsername(username)
  if (!user || !comparePassword(password, user.password)) {
    log.warn('用户登录失败', '尝试登录用户名', username)
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = generateToken(user.id, user.role)

  log.debug('用户登录', '登录用户名', username, '角色', user.role, '用户ID', user.id)

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
});

export default authRouter;