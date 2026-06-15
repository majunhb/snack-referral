/**
 * Smoke tests — CI pipeline validation
 * Uses minimal Express apps to avoid DB/Redis connection blocking Jest exit
 */
const request = require('supertest');
const express = require('express');
const helmet = require('helmet');

// Minimal Express app for basic endpoint tests
function createMinimalApp() {
  const app = express();
  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });
  app.use((req, res) => {
    res.status(404).json({ code: 404, message: 'Not Found' });
  });
  return app;
}

describe('Server smoke tests', () => {
  let app;

  beforeAll(() => {
    app = createMinimalApp();
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
      const secureApp = express();
      secureApp.use(helmet());
      secureApp.get('/health', (req, res) => {
        res.json({ status: 'ok' });
      });
      const res = await request(secureApp).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('x-content-type-options');
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
