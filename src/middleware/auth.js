const logger = require('../utils/logger');

/**
 * Simple API key validation middleware
 * This is a basic implementation - in production, use more robust authentication
 */
const validateApiKey = (req, res, next) => {
  // For development, skip API key validation
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    logger.warn('API request without API key', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'API key required. Please provide a valid API key in the x-api-key header.'
      }
    });
  }

  // In production, validate against a database or external service
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key used', {
      apiKey: apiKey.substring(0, 8) + '***',
      ip: req.ip,
      url: req.originalUrl
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key provided.'
      }
    });
  }

  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info('Response sent', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: data?.success || false
    });

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  validateApiKey,
  requestLogger
};
