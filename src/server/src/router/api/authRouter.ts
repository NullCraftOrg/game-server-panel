import { Router } from 'express';
import { DBUsers } from '../../db.ts'
import { comparePassword, generateToken } from '../../auth.ts';

const authRouter = Router();

// 注册
authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' })
    }

    const existing = DBUsers.getUser(username)
    if (existing) {
        return res.status(409).json({ error: 'Username already exists' })
    }

    // 检查是否首个用户 -> 设为 admin
    const userCount = DBUsers.getCount();
    const role = userCount === 0 ? 'admin' : 'user';

    const resultUser = DBUsers.addUser(username, password, role)

    const token = generateToken(resultUser.id, resultUser.role);
    res.json({ token, user: { id: resultUser.id, username: resultUser.username, role: resultUser.role } });
});

// 登录
authRouter.post('/login', async (req, res) => {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' })
      }
      
      const user = DBUsers.getUser(username)
      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = generateToken(user.id, user.role);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
});

export default authRouter;