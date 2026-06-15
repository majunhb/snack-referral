/**
 * 小吃店"老带新"裂变营销小程序 - 后端入口
 * 启动 Express 服务，注册路由、中间件
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// 全局限流：每 IP 15 分钟最多 600 次请求
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: { code: 429, msg: '请求过于频繁，请稍后再试' }
}));

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 业务路由
app.use('/api', routes);

// 404
app.use((req, res) => res.status(404).json({ code: 404, msg: '接口不存在' }));

// 全局错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 服务已启动: http://localhost:${PORT}`);
  logger.info(`📖 API 文档: http://localhost:${PORT}/api`);
});

module.exports = app;
