import express from "express";

import serverRouter from "./api/serversRouter.ts";
import monitorRouter from "./api/monitorRouter.ts";

const router = express.Router();

router.use("/api/servers", serverRouter);
router.use("/api/monitor", monitorRouter);

router.get("/", (req, res) => {
  res.send("Index!");
});

export default router;