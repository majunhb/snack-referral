const { BizError } = require('../utils/response');

/**
 * 防刷中间件：基于 Redis 的频控
 * - 同手机号：1 分钟内最多 1 次注册
 * - 同 IP：1 分钟内最多 10 次请求
 */
const redisStore = new Map(); // 简化用内存，生产替换 ioredis

function makeKey(prefix, identifier) {
  return `rl:${prefix}:${identifier}`;
}

function frequencyLimit({ windowMs, max, keyFn, message }) {
  return (req, res, next) => {
    const id = keyFn(req);
    if (!id) return next();
    const key = makeKey(keyFn.name || 'default', id);
    const now = Date.now();
    const arr = (redisStore.get(key) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) {
      return res.status(429).json({ code: 429, msg: message || '操作过于频繁' });
    }
    arr.push(now);
    redisStore.set(key, arr);
    next();
  };
}

const registerLimit = frequencyLimit({
  windowMs: 60 * 1000,
  max: 1,
  keyFn: req => req.body.phone,
  message: '该手机号 1 分钟内已注册过，请稍后再试'
});

const ipLimit = frequencyLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyFn: req => req.ip,
  message: 'IP 访问过于频繁'
});

module.exports = { registerLimit, ipLimit };
