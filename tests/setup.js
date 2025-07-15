// Test setup file
jest.setTimeout(30000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.HUGGING_FACE_API_KEY = 'test-key';
process.env.CACHE_TTL_SECONDS = '60';
