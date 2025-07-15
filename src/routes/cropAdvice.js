const express = require('express');
const router = express.Router();

const { validateCropAdvice } = require('../validators/cropAdvice');
const { requestLogger } = require('../middleware/auth');
const translationService = require('../services/translationService');
const cropRecommendationService = require('../services/cropRecommendationService');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

// Apply middleware
router.use(requestLogger);

/**
 * POST /api/v1/crop-advice
 * Get personalized crop recommendations in farmer's native language
 */
router.post('/', validateCropAdvice, async (req, res, next) => {
  try {
    const { question, language, farmerContext = {} } = req.body;
    const startTime = Date.now();

    logger.info('Processing crop advice request', {
      language,
      hasContext: Object.keys(farmerContext).length > 0,
      questionLength: question.length
    });

    // Check cache first
    const cacheKey = cache.generateCacheKey(question, language, farmerContext);
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      logger.info('Returning cached response', { cacheKey });
      return res.json({
        success: true,
        data: {
          ...cachedResponse,
          cached: true
        },
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });
    }

    // Step 1: Translate question to English (if not already in English)
    let translatedQuestion = question;
    if (language !== 'en') {
      logger.info('Translating question to English', { fromLanguage: language });
      translatedQuestion = await translationService.translateToEnglish(question, language);
      logger.info('Question translated', { translatedQuestion });
    }

    // Step 2: Generate crop recommendations
    logger.info('Generating crop recommendations');
    const recommendations = await cropRecommendationService.generateRecommendations(
      translatedQuestion,
      farmerContext
    );

    // Step 3: Translate response back to original language (if not English)
    let nativeResponse = recommendations.response;
    if (language !== 'en') {
      logger.info('Translating response to native language', { toLanguage: language });
      nativeResponse = await translationService.translateFromEnglish(
        recommendations.response,
        language
      );
      logger.info('Response translated');
    }

    // Prepare final response
    const responseData = {
      originalQuestion: question,
      translatedQuestion: language !== 'en' ? translatedQuestion : undefined,
      englishResponse: recommendations.response,
      nativeResponse: language !== 'en' ? nativeResponse : recommendations.response,
      recommendations: recommendations.recommendations,
      additionalTips: recommendations.additionalTips,
      language,
      farmerContext
    };

    // Cache the response
    cache.set(cacheKey, responseData, 3600); // Cache for 1 hour

    const processingTime = Date.now() - startTime;
    logger.info('Crop advice request completed', {
      processingTime: `${processingTime}ms`,
      recommendationsCount: recommendations.recommendations.length
    });

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    logger.error('Error processing crop advice request', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
});

/**
 * GET /api/v1/crop-advice/languages
 * Get list of supported languages
 */
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
  ];

  res.json({
    success: true,
    data: {
      languages: supportedLanguages,
      total: supportedLanguages.length
    }
  });
});

/**
 * GET /api/v1/crop-advice/soil-types
 * Get list of supported soil types
 */
router.get('/soil-types', (req, res) => {
  const soilTypes = [
    { code: 'black', name: 'Black Soil', description: 'Rich in clay, good for cotton and sugarcane' },
    { code: 'red', name: 'Red Soil', description: 'Rich in iron, good for cotton and wheat' },
    { code: 'alluvial', name: 'Alluvial Soil', description: 'Very fertile, good for cereals' },
    { code: 'sandy', name: 'Sandy Soil', description: 'Well-drained, good for millets' },
    { code: 'clayey', name: 'Clayey Soil', description: 'Water retentive, good for rice' },
    { code: 'loamy', name: 'Loamy Soil', description: 'Balanced soil, good for most crops' },
    { code: 'laterite', name: 'Laterite Soil', description: 'Good for tea, coffee, and spices' },
    { code: 'mountain', name: 'Mountain Soil', description: 'Good for horticulture and forestry' }
  ];

  res.json({
    success: true,
    data: {
      soilTypes,
      total: soilTypes.length
    }
  });
});

/**
 * GET /api/v1/crop-advice/seasons
 * Get list of cropping seasons
 */
router.get('/seasons', (req, res) => {
  const seasons = [
    { 
      code: 'kharif', 
      name: 'Kharif (Monsoon)', 
      description: 'June-October, rain-fed crops',
      crops: ['Rice', 'Cotton', 'Sugarcane', 'Maize', 'Sorghum']
    },
    { 
      code: 'rabi', 
      name: 'Rabi (Winter)', 
      description: 'November-April, winter crops',
      crops: ['Wheat', 'Gram', 'Mustard', 'Barley', 'Peas']
    },
    { 
      code: 'zaid', 
      name: 'Zaid (Summer)', 
      description: 'March-June, summer crops',
      crops: ['Watermelon', 'Cucumber', 'Fodder', 'Vegetables']
    }
  ];

  res.json({
    success: true,
    data: {
      seasons,
      total: seasons.length
    }
  });
});

/**
 * GET /api/v1/crop-advice/stats
 * Get API usage statistics
 */
router.get('/stats', (req, res) => {
  const cacheStats = cache.getStats();
  
  res.json({
    success: true,
    data: {
      cache: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        keys: cacheStats.keys,
        hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0
      },
      supportedLanguages: 11,
      supportedSoilTypes: 8,
      croppingSeasonsSupported: 3
    }
  });
});

module.exports = router;
