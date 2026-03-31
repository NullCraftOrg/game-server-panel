const express = require('express');

const router = express.Router();
const apiRouter = require('./api');

router.get('/', (req, res) => {
  res.send('Index move to /api path');
});

module.exports = {
    router,
    apiRouter
}