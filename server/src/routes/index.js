const apiRouter = require('./api');
const adminRouter = require('./admin');
const Router = require('express').Router;

const router = Router();
router.use(apiRouter);
router.use(adminRouter);

module.exports = router;
