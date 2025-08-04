const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const logger = require('./src/utils/logger');
const cropAdviceRouter = require('./src/routes/cropAdvice');
const errorHandler = require('./src/middleware/errorHandler');
const { validateApiKey } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for test.html and other static assets)
app.use(express.static('.')); // Serves files from root directory

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'AgriGuru API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2d5016; }
    .swagger-ui .scheme-container { background: #f8f9fa; }
  `,
  customCssUrl: null
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configuration endpoint for frontend
app.get('/config', (req, res) => {
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;
  
  res.json({
    baseUrl,
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: `${baseUrl}/health`,
      cropAdvice: `${baseUrl}/api/v1/crop-advice`,
      languages: `${baseUrl}/api/v1/crop-advice/languages`,
      soilTypes: `${baseUrl}/api/v1/crop-advice/soil-types`,
      seasons: `${baseUrl}/api/v1/crop-advice/seasons`,
      stats: `${baseUrl}/api/v1/crop-advice/stats`,
      docs: `${baseUrl}/docs.html`,
      apiDocs: `${baseUrl}/api-docs`,
      test: `${baseUrl}/test.html`
    }
  });
});

// API routes
app.use('/api/v1/crop-advice', cropAdviceRouter);

// API documentation endpoint
app.get('/api/v1', (req, res) => {
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;
  
  res.json({
    name: 'AgriGuru API',
    version: '1.0.0',
    description: 'AI-powered multilingual farming assistant for Indian farmers',
    baseUrl,
    endpoints: {
      'POST /api/v1/crop-advice': 'Get personalized crop recommendations',
      'GET /health': 'Health check endpoint',
      'GET /api/v1': 'API documentation',
      'GET /config': 'API configuration and URLs'
    },
    supportedLanguages: [
      'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'
    ]
  });
});

// Root endpoint - Welcome page
app.get('/', (req, res) => {
  res.json({
    message: '🌾 Welcome to AgriGuru API',
    description: 'AI-powered multilingual farming assistant for Indian farmers',
    version: '1.0.0',
    documentation: {
      'Interactive API Docs': '/api-docs',
      'Test Interface': '/test.html',
      'Complete Documentation': '/docs.html',
      'WIKI Documentation': '/wiki-docs.html',
      'Health Check': '/health'
    },
    api: {
      'Main Endpoint': '/api/v1/crop-advice',
      'API Info': '/api/v1',
      'Supported Languages': '/api/v1/crop-advice/languages'
    },
    features: [
      '11 Indian languages + English support',
      'AI-powered crop recommendations',
      'Context-aware farming advice',
      'Intelligent fallback system'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: {
      'Root': '/',
      'Health': '/health',
      'API Docs': '/api-docs',
      'Test Interface': '/test.html',
      'Main API': '/api/v1/crop-advice'
    }
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`AgriGuru API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
