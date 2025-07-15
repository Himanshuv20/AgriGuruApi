const request = require('supertest');
const app = require('../server');

describe('AgriGuru API', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('API Documentation', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'AgriGuru API');
      expect(response.body).toHaveProperty('supportedLanguages');
    });
  });

  describe('Crop Advice Endpoint', () => {
    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/crop-advice')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should return validation error for short question', async () => {
      const response = await request(app)
        .post('/api/v1/crop-advice')
        .send({
          question: 'Hi',
          language: 'en'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return validation error for unsupported language', async () => {
      const response = await request(app)
        .post('/api/v1/crop-advice')
        .send({
          question: 'What crop should I grow?',
          language: 'fr'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Support Endpoints', () => {
    it('should return supported languages', async () => {
      const response = await request(app)
        .get('/api/v1/crop-advice/languages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.languages).toBeInstanceOf(Array);
      expect(response.body.data.languages.length).toBeGreaterThan(0);
    });

    it('should return soil types', async () => {
      const response = await request(app)
        .get('/api/v1/crop-advice/soil-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.soilTypes).toBeInstanceOf(Array);
    });

    it('should return seasons', async () => {
      const response = await request(app)
        .get('/api/v1/crop-advice/seasons')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.seasons).toBeInstanceOf(Array);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });
  });
});

module.exports = app;
