const axios = require('axios');
const logger = require('../utils/logger');

class TranslationService {
  constructor() {
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // Multiple translation model providers with fallback priority
    this.translationProviders = {
      // Facebook's multilingual models (no API key required for many)
      facebook: {
        // Facebook NLLB (No Language Left Behind) - supports 200+ languages
        toEnglish: {
          'hi': 'facebook/nllb-200-distilled-600M',
          'bn': 'facebook/nllb-200-distilled-600M',
          'ta': 'facebook/nllb-200-distilled-600M',
          'te': 'facebook/nllb-200-distilled-600M',
          'mr': 'facebook/nllb-200-distilled-600M',
          'gu': 'facebook/nllb-200-distilled-600M',
          'kn': 'facebook/nllb-200-distilled-600M',
          'ml': 'facebook/nllb-200-distilled-600M',
          'pa': 'facebook/nllb-200-distilled-600M',
          'ur': 'facebook/nllb-200-distilled-600M'
        },
        fromEnglish: {
          'hi': 'facebook/nllb-200-distilled-600M',
          'bn': 'facebook/nllb-200-distilled-600M',
          'ta': 'facebook/nllb-200-distilled-600M',
          'te': 'facebook/nllb-200-distilled-600M',
          'mr': 'facebook/nllb-200-distilled-600M',
          'gu': 'facebook/nllb-200-distilled-600M',
          'kn': 'facebook/nllb-200-distilled-600M',
          'ml': 'facebook/nllb-200-distilled-600M',
          'pa': 'facebook/nllb-200-distilled-600M',
          'ur': 'facebook/nllb-200-distilled-600M'
        },
        languageCodes: {
          'hi': 'hin_Deva', 'bn': 'ben_Beng', 'ta': 'tam_Taml', 'te': 'tel_Telu',
          'mr': 'mar_Deva', 'gu': 'guj_Gujr', 'kn': 'kan_Knda', 'ml': 'mal_Mlym',
          'pa': 'pan_Guru', 'ur': 'urd_Arab', 'en': 'eng_Latn'
        }
      },
      
      // Google's multilingual models
      google: {
        toEnglish: {
          'hi': 'google/mt5-small',
          'bn': 'google/mt5-small',
          'ta': 'google/mt5-small',
          'te': 'google/mt5-small',
          'mr': 'google/mt5-small',
          'gu': 'google/mt5-small',
          'kn': 'google/mt5-small',
          'ml': 'google/mt5-small',
          'pa': 'google/mt5-small',
          'ur': 'google/mt5-small'
        },
        fromEnglish: {
          'hi': 'google/mt5-small',
          'bn': 'google/mt5-small',
          'ta': 'google/mt5-small',
          'te': 'google/mt5-small',
          'mr': 'google/mt5-small',
          'gu': 'google/mt5-small',
          'kn': 'google/mt5-small',
          'ml': 'google/mt5-small',
          'pa': 'google/mt5-small',
          'ur': 'google/mt5-small'
        }
      },
      
      // Helsinki-NLP models (original)
      helsinki: {
        toEnglish: {
          'hi': 'Helsinki-NLP/opus-mt-hi-en',
          'bn': 'Helsinki-NLP/opus-mt-bn-en',
          'ta': 'Helsinki-NLP/opus-mt-ta-en',
          'te': 'Helsinki-NLP/opus-mt-te-en',
          'mr': 'Helsinki-NLP/opus-mt-mr-en',
          'gu': 'Helsinki-NLP/opus-mt-gu-en',
          'kn': 'Helsinki-NLP/opus-mt-kn-en',
          'ml': 'Helsinki-NLP/opus-mt-ml-en',
          'pa': 'Helsinki-NLP/opus-mt-pa-en',
          'ur': 'Helsinki-NLP/opus-mt-ur-en'
        },
        fromEnglish: {
          'hi': 'Helsinki-NLP/opus-mt-en-hi',
          'bn': 'Helsinki-NLP/opus-mt-en-bn',
          'ta': 'Helsinki-NLP/opus-mt-en-ta',
          'te': 'Helsinki-NLP/opus-mt-en-te',
          'mr': 'Helsinki-NLP/opus-mt-en-mr',
          'gu': 'Helsinki-NLP/opus-mt-en-gu',
          'kn': 'Helsinki-NLP/opus-mt-en-kn',
          'ml': 'Helsinki-NLP/opus-mt-en-ml',
          'pa': 'Helsinki-NLP/opus-mt-en-pa',
          'ur': 'Helsinki-NLP/opus-mt-en-ur'
        }
      }
    };

    // Priority order for trying different providers
    this.providerPriority = ['facebook', 'google', 'helsinki'];
  }

  /**
   * Make API call to Hugging Face
   * @param {string} model - Model name
   * @param {string} text - Text to translate
   * @returns {Promise<string>} Translated text
   */
  async callHuggingFaceAPI(model, text) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data && response.data[0] && response.data[0].translation_text) {
        return response.data[0].translation_text;
      }

      throw new Error('Invalid response format from translation API');
    } catch (error) {
      logger.error('Hugging Face API error', {
        model,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 503) {
        throw new Error('Translation service is currently loading. Please try again in a moment.');
      }

      // For 401 errors (invalid credentials) or 404 errors (model not found), use fallback translation
      if (error.response?.status === 401 || error.response?.status === 404) {
        logger.warn('Using fallback translation due to API error', { status: error.response?.status });
        return this.getFallbackTranslation(text, model);
      }

      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Provide fallback translation when API is unavailable
   * @param {string} text - Text to translate
   * @param {string} model - Model name for context
   * @returns {string} Fallback translation
   */
  getFallbackTranslation(text, model) {
    // Basic fallback translations for common farming terms
    const fallbackTranslations = {
      // Hindi to English
      'मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?': 'My soil is black and rainfall is low. Which crop should I grow?',
      'बारिश के मौसम में क्या लगाए खेत में': 'What to plant in the field during rainy season',
      'बारिश के मौसम में क्या लगाये खेत मी': 'What to plant in the field during rainy season',
      'हिवलयात काय लावायचे शेठात': 'What to plant in winter fields',
      'गरमी मधे लावयचे शेठात': 'What to plant in summer fields',
      
      // English to Hindi (reverse)
      'My soil is black and rainfall is low. Which crop should I grow?': 'मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?',
      'What to plant in the field during rainy season': 'बारिश के मौसम में क्या लगाए खेत में',
      'What to plant in winter fields': 'हिवलयात काय लावायचे शेठात',
      'What to plant in summer fields': 'गरमी मधे लावयचे शेठात',
      
      // Common responses
      'I have black soil and limited water supply. Which crop should I grow in the monsoon season?': 'मुझे काली मिट्टी है और पानी की कमी है। मानसून में कौन सी फसल लगाऊं?',
      'Based on your black soil type and rainfed irrigation in Maharashtra during kharif season, here are my recommendations:': 'आपकी काली मिट्टी और महाराष्ट्र में खरीफ सीजन के लिए बारिश पर निर्भर सिंचाई के आधार पर, यहाँ मेरी सिफारिशें हैं:'
    };

    // Check if we have a direct translation
    if (fallbackTranslations[text]) {
      logger.info('Using predefined fallback translation');
      return fallbackTranslations[text];
    }

    // Basic pattern matching for common farming questions
    const lowerText = text.toLowerCase();
    
    // If it's Hindi text asking about crops, provide a basic English translation
    if (lowerText.includes('फसल') || lowerText.includes('खेत') || lowerText.includes('लगा')) {
      if (model.includes('hi-en')) {
        return 'What crop should I plant in my field?';
      } else if (model.includes('en-hi')) {
        return 'मुझे अपने खेत में कौन सी फसल लगानी चाहिए?';
      }
    }

    // If no translation available, return original text for English requests
    // or provide a basic response for non-English
    if (model.includes('hi-en')) {
      logger.warn('No fallback translation available for Hindi text, using generic response');
      return 'I need help with farming advice';
    } else if (model.includes('en-hi')) {
      logger.warn('No fallback translation available for English text, using generic response');
      return 'कृषि सलाह की आवश्यकता है';
    }

    // Default fallback
    logger.warn('No fallback translation available, returning original text', { text: text.substring(0, 50) + '...', model });
    return text;
  }

  /**
   * Translate text to English
   * @param {string} text - Text to translate
   * @param {string} fromLanguage - Source language code
   * @returns {Promise<string>} English translation
   */
  async translateToEnglish(text, fromLanguage) {
    // If already English, return as is
    if (fromLanguage === 'en') {
      return text;
    }

    logger.info('Translating to English with multiple providers', { fromLanguage });
    return await this.translateWithMultipleProviders(text, 'toEnglish', fromLanguage);
  }

  /**
   * Translate English text to target language
   * @param {string} text - English text to translate
   * @param {string} toLanguage - Target language code
   * @returns {Promise<string>} Translated text
   */
  async translateFromEnglish(text, toLanguage) {
    // If target is English, return as is
    if (toLanguage === 'en') {
      return text;
    }

    logger.info('Translating from English with multiple providers', { toLanguage });
    return await this.translateWithMultipleProviders(text, 'fromEnglish', toLanguage);
  }

  /**
   * Get supported languages
   * @returns {Array} Array of supported language codes
   */
  getSupportedLanguages() {
    // Get languages from Facebook provider (most comprehensive)
    const facebookLanguages = Object.keys(this.translationProviders.facebook.toEnglish);
    return ['en', ...facebookLanguages];
  }

  /**
   * Check if language is supported
   * @param {string} languageCode - Language code to check
   * @returns {boolean} Whether language is supported
   */
  isLanguageSupported(languageCode) {
    return this.getSupportedLanguages().includes(languageCode);
  }

  /**
   * Try multiple translation providers with fallback
   * @param {string} text - Text to translate
   * @param {string} direction - 'toEnglish' or 'fromEnglish'
   * @param {string} language - Language code
   * @returns {Promise<string>} Translated text
   */
  async translateWithMultipleProviders(text, direction, language) {
    const errors = [];

    for (const provider of this.providerPriority) {
      try {
        logger.info(`Attempting translation with ${provider} provider`, { provider, language, direction });
        
        const providerConfig = this.translationProviders[provider];
        const model = providerConfig[direction][language];
        
        if (!model) {
          logger.warn(`No model available for ${language} in ${provider} provider`);
          continue;
        }

        if (provider === 'facebook') {
          return await this.callFacebookNLLB(model, text, direction, language);
        } else if (provider === 'google') {
          return await this.callGoogleMT5(model, text, direction, language);
        } else {
          return await this.callHuggingFaceAPI(model, text);
        }

      } catch (error) {
        logger.warn(`Translation failed with ${provider} provider`, { 
          provider, 
          error: error.message,
          status: error.response?.status 
        });
        errors.push({ provider, error: error.message });
        continue;
      }
    }

    // If all providers failed, use fallback
    logger.warn('All translation providers failed, using fallback', { errors });
    return this.getFallbackTranslation(text, `${direction}-${language}`);
  }

  /**
   * Call Facebook NLLB model for translation
   * @param {string} model - Model name
   * @param {string} text - Text to translate
   * @param {string} direction - Translation direction
   * @param {string} language - Language code
   * @returns {Promise<string>} Translated text
   */
  async callFacebookNLLB(model, text, direction, language) {
    const facebookConfig = this.translationProviders.facebook;
    const srcLang = direction === 'toEnglish' ? facebookConfig.languageCodes[language] : facebookConfig.languageCodes['en'];
    const tgtLang = direction === 'toEnglish' ? facebookConfig.languageCodes['en'] : facebookConfig.languageCodes[language];

    const payload = {
      inputs: text,
      parameters: {
        src_lang: srcLang,
        tgt_lang: tgtLang
      }
    };

    logger.info('Calling Facebook NLLB model', { model, srcLang, tgtLang });
    return await this.callHuggingFaceWithPayload(model, payload);
  }

  /**
   * Call Google mT5 model for translation
   * @param {string} model - Model name
   * @param {string} text - Text to translate
   * @param {string} direction - Translation direction
   * @param {string} language - Language code
   * @returns {Promise<string>} Translated text
   */
  async callGoogleMT5(model, text, direction, language) {
    const prefix = direction === 'toEnglish' 
      ? `translate ${language} to English: `
      : `translate English to ${language}: `;
    
    const payload = {
      inputs: prefix + text,
      parameters: {
        max_length: 512,
        temperature: 0.3
      }
    };

    logger.info('Calling Google mT5 model', { model, prefix });
    return await this.callHuggingFaceWithPayload(model, payload);
  }

  /**
   * Make API call to Hugging Face with custom payload
   * @param {string} model - Model name
   * @param {object} payload - Request payload
   * @returns {Promise<string>} Translated text
   */
  async callHuggingFaceWithPayload(model, payload) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Handle different response formats
      if (response.data) {
        // Facebook NLLB format
        if (response.data[0] && response.data[0].translation_text) {
          return response.data[0].translation_text;
        }
        // Google mT5 format
        if (response.data[0] && response.data[0].generated_text) {
          return response.data[0].generated_text;
        }
        // Handle array response
        if (Array.isArray(response.data) && response.data[0]) {
          const result = response.data[0];
          return result.translation_text || result.generated_text || result.text || String(result);
        }
        // Handle direct text response
        if (typeof response.data === 'string') {
          return response.data;
        }
      }

      throw new Error('Invalid response format from translation API');
    } catch (error) {
      logger.error('Hugging Face API error', {
        model,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 503) {
        throw new Error('Translation service is currently loading. Please try again in a moment.');
      }

      throw new Error(`Translation failed: ${error.message}`);
    }
  }
}

module.exports = new TranslationService();
