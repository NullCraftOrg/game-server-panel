import express from "express";
import systemMonitor from "../../core/systemMonitor.ts";

const monitorRouter = express.Router();

//BaseURL = /api/servers

monitorRouter.get("/", (req, res) => {
  res.json(systemMonitor.getInfo())
});

export default monitorRouter