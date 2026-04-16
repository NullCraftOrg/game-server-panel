import express from 'express'

import serverRouter from './api/serversRouter.ts'
import monitorRouter from './api/monitorRouter.ts'

import authRouter from './api/authRouter.ts'
import userRouter from './api/userRouter.ts'

import { authMiddleware } from '../middleware/authMiddleware.ts'

const router = express.Router()

// 注册登录
router.use("/api/auth", authRouter)
// 用户信息
router.use("/api/users", authMiddleware, userRouter)
// 服务器相关
router.use("/api/servers", authMiddleware,serverRouter)
// 监控信息
router.use("/api/monitor", authMiddleware, monitorRouter)

router.get("/", (req, res) => {
  res.send("Index!")
})

export default router