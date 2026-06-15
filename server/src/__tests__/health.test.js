/**
 * 冒烟测试 — 验证 Express 基础功能
 * 不引入完整 app 以避免 DB/Redis 连接阻塞进程退出
 */
const request = require('supertest');

// 创建最小化 Express 应用用于冒烟测试
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 404 handling
  app.use((req, res) => {
    res.status(404).json({ code: 404, message: 'Not Found' });
  });

  return app;
}

describe('Server smoke tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('time');
    });
  });

  describe('Unknown routes', () => {
    it('should return 404 for unknown endpoint', async () => {
      const res = await request(app).get('/api/non-existent-route-xyz');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 404);
    });
  });

  describe('Security headers', () => {
    it('should include security headers from helmet', async () => {
      // 需要 helmet 中间件，单独测试 app 模块
      const fullApp = require('../../app');
      const res = await request(fullApp).get('/health');
      expect(res.status).toBe(200);
      // helmet 会设置安全头
      expect(res.headers).toHaveProperty('x-content-type-options');
    });

    afterAll(() => {
      // 帮助清理 app.js 启动的 server
      // supertest 的 server 会自动关闭
    });
  });

  describe('JSON body parsing', () => {
    it('should accept JSON body', async () => {
      const body = { username: 'test', password: 'test123' };
      const res = await request(app)
        .post('/health')
        .send(body)
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(200);
    });
  });
});
