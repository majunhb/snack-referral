const jwt = require('jsonwebtoken');
const { ApiResponse } = require('../utils/response');

/** 生成 JWT */
function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

/** 校验 JWT 中间件 */
function verify(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json(ApiResponse.fail(401, '未登录'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_e) {
    return res.status(401).json(ApiResponse.fail(401, '登录已过期'));
  }
}

/** 商家管理员校验 */
function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json(ApiResponse.fail(401, '未登录'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json(ApiResponse.fail(403, '无权限'));
    req.admin = decoded;
    next();
  } catch (_e) {
    return res.status(401).json(ApiResponse.fail(401, '登录已过期'));
  }
}

module.exports = { sign, verify, verifyAdmin };
