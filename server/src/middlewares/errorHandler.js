const logger = require('../utils/logger');

module.exports = function errorHandler(err, req, res, _next) {
  logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });
  if (err.code && err.code < 10000) {
    return res.status(200).json({ code: err.code, msg: err.message, data: null });
  }
  res.status(500).json({ code: 500, msg: '服务器内部错误' });
};
