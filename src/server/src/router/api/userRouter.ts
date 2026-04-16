import { Router } from 'express'
import { DBUsers } from '../../db.ts'
import { authMiddleware } from '../../middleware/authMiddleware.ts'

const userRouter = Router()

// BASE URL /api/users

/** 获取用户列表 */
userRouter.get('/', authMiddleware, async (req, res) => {
  const reqUser = (req as any).user
  if (reqUser.role !== 'admin') {
    return res.status(403).end()
  }
  const users = DBUsers.listUsers()
  res.json(users)
})

/** 更新用户 */
userRouter.put('/:id', authMiddleware, async (req, res) => {
  const reqUser = (req as any).user
  if (reqUser.role !== 'admin') {
    return res.status(403).end()
  }
  const uid = Number(req.params.id)
  if (isNaN(uid)) {
    return res.status(404).end()
  }
  const updateUser = DBUsers.updateUser(uid, req.body)
  if (!updateUser) {
    return res.status(404).end()
  }
  res.status(200).end()
})

/** 删除用户 */
userRouter.delete('/:id', authMiddleware, (req, res) => {
  const reqUser = (req as any).user
  console.log('删除用户', req)
  if (reqUser.role !== 'admin') {
    return res.status(403).end()
  }
  const uid = Number(req.params.id)
  if (isNaN(uid)) {
    return res.status(404).end()
  }
  const deleteUser = DBUsers.deleteUser(uid)
  if (!deleteUser) {
    return res.status(404).end()
  }
  res.status(200).end()
})

export default userRouter