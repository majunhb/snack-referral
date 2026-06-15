/**
 * 冒烟测试 — CI 管线验证
 * 验证 app 入口、路由响应、404 处理
 */
const request = require('supertest');

// 在加载 app 前设置必要环境变量
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_NAME = process.env.DB_NAME || 'snack_referral';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'root123';
process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.AES_KEY = process.env.AES_KEY || 'this_is_a_32byte_key_for_aes_enc!!';
process.env.NODE_ENV = 'test';

// app.js 现在不会自动 listen，require 只创建 Express 实例
const app = require('../../app');

describe('Server smoke tests', () => {

  // 健康检查
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('time');
    });
  });

  // 404 处理
  describe('Unknown routes', () => {
    it('should return 404 for unknown endpoint', async () => {
      const res = await request(app).get('/api/non-existent-route-xyz');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 404);
    });
  });

  // 安全头（Helmet）
  describe('Security headers', () => {
    it('should include security headers from helmet', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('x-content-type-options');
    });
  });

  // JSON 解析
  describe('JSON body parsing', () => {
    it('should accept JSON body', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({ code: 'test_wx_code' })
        .set('Content-Type', 'application/json');
      // 期望 200（即使业务逻辑失败，JSON 解析应正常工作）
      expect(res.status).toBe(200);
    });
  });
});
