import { Router } from 'express';
import { DBUsers } from '../../db.ts'
import { authMiddleware } from '../../middleware/authMiddleware.ts';

const userRouter = Router();

// BASE URL /api/users

userRouter.get('/', authMiddleware, async (req, res) => {
  const user = await DBUsers.getUserById((req as any).user.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, username: user.username, role: user.role });
})

export default userRouter;