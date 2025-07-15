const Joi = require('joi');

/**
 * Validation schema for crop advice request
 */
const cropAdviceSchema = Joi.object({
  question: Joi.string()
    .required()
    .min(10)
    .max(1000)
    .trim()
    .messages({
      'string.empty': 'Question is required',
      'string.min': 'Question must be at least 10 characters long',
      'string.max': 'Question must not exceed 1000 characters',
      'any.required': 'Question is required'
    }),

  language: Joi.string()
    .required()
    .valid('hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'en')
    .messages({
      'any.only': 'Language must be one of: hi, bn, ta, te, mr, gu, kn, ml, pa, ur, en',
      'any.required': 'Language is required'
    }),

  farmerContext: Joi.object({
    location: Joi.string().optional().trim(),
    soilType: Joi.string()
      .optional()
      .valid('black', 'red', 'alluvial', 'sandy', 'clayey', 'loamy', 'laterite', 'mountain')
      .messages({
        'any.only': 'Soil type must be one of: black, red, alluvial, sandy, clayey, loamy, laterite, mountain'
      }),
    season: Joi.string()
      .optional()
      .valid('kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon')
      .messages({
        'any.only': 'Season must be one of: kharif, rabi, zaid, summer, winter, monsoon'
      }),
    farmSize: Joi.string().optional().trim(),
    cropHistory: Joi.array().items(Joi.string()).optional(),
    budget: Joi.string().optional(),
    irrigation: Joi.string()
      .optional()
      .valid('rainfed', 'irrigated', 'drip', 'sprinkler', 'canal', 'borewell')
      .messages({
        'any.only': 'Irrigation type must be one of: rainfed, irrigated, drip, sprinkler, canal, borewell'
      }),
    experience: Joi.string()
      .optional()
      .valid('beginner', 'intermediate', 'experienced')
      .messages({
        'any.only': 'Experience level must be one of: beginner, intermediate, experienced'
      })
  }).optional()
});

/**
 * Validate crop advice request
 * @param {object} data - Request data to validate
 * @returns {object} Validation result
 */
const validateCropAdviceRequest = (data) => {
  return cropAdviceSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

/**
 * Express middleware for validating crop advice requests
 */
const validateCropAdvice = (req, res, next) => {
  const { error, value } = validateCropAdviceRequest(req.body);

  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }

  req.body = value;
  next();
};

module.exports = {
  cropAdviceSchema,
  validateCropAdviceRequest,
  validateCropAdvice
};
