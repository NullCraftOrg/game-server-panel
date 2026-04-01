import express from "express";

const monitorRouter = express.Router();

//BaseURL = /api/servers

monitorRouter.get("/", (req, res) => {
  res.send("Hello World! from monitorRouter");
  //TODO res.json(systemMonitor.getInfo());
});

export default monitorRouter;