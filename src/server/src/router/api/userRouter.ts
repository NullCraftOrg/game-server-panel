import { Router } from 'express'
import { DBUsers } from '../../db.ts'
import { authMiddleware } from '../../middleware/authMiddleware.ts'

const userRouter = Router();

// BASE URL /api/users

userRouter.get('/', authMiddleware, async (req, res) => {
  const reqUser = (req as any).user
  if(reqUser.role !== 'admin') {
    return res.status(403).end()
  }
  const users = DBUsers.listUsers()
  res.json(users)
})

export default userRouter;