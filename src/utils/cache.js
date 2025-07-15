const NodeCache = require('node-cache');
const crypto = require('crypto');

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600, // 1 hour default
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false
    });
  }

  /**
   * Generate cache key from request data
   * @param {string} question - Original question
   * @param {string} language - Language code
   * @param {object} context - Farmer context
   * @returns {string} Cache key
   */
  generateCacheKey(question, language, context = {}) {
    const dataString = JSON.stringify({
      question: question.toLowerCase().trim(),
      language,
      context
    });
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  /**
   * Get cached response
   * @param {string} key - Cache key
   * @returns {object|null} Cached data or null
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Set cache with custom TTL
   * @param {string} key - Cache key
   * @param {object} data - Data to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, data, ttl = null) {
    if (ttl) {
      this.cache.set(key, data, ttl);
    } else {
      this.cache.set(key, data);
    }
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  flush() {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return this.cache.getStats();
  }
}

module.exports = new CacheManager();
