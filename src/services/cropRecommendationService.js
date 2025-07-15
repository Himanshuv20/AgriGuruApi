const axios = require('axios');
const logger = require('../utils/logger');

class CropRecommendationService {
  constructor() {
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // Crop knowledge base for Indian agriculture
    this.cropDatabase = {
      // Kharif crops (Monsoon season)
      kharif: {
        rice: {
          soilTypes: ['alluvial', 'clayey', 'loamy'],
          waterRequirement: 'high',
          climate: 'humid, warm',
          duration: '120-150 days',
          benefits: 'High yield, staple food crop'
        },
        cotton: {
          soilTypes: ['black', 'alluvial'],
          waterRequirement: 'moderate',
          climate: 'warm, dry',
          duration: '180-200 days',
          benefits: 'Cash crop, good market demand'
        },
        sugarcane: {
          soilTypes: ['alluvial', 'black', 'red'],
          waterRequirement: 'high',
          climate: 'warm, humid',
          duration: '300-365 days',
          benefits: 'High income, industrial use'
        },
        maize: {
          soilTypes: ['alluvial', 'red', 'black'],
          waterRequirement: 'moderate',
          climate: 'warm',
          duration: '90-120 days',
          benefits: 'Quick harvest, multiple uses'
        },
        sorghum: {
          soilTypes: ['black', 'red', 'sandy'],
          waterRequirement: 'low',
          climate: 'dry, warm',
          duration: '100-120 days',
          benefits: 'Drought resistant, nutritious'
        }
      },
      // Rabi crops (Winter season)
      rabi: {
        wheat: {
          soilTypes: ['alluvial', 'black', 'clayey'],
          waterRequirement: 'moderate',
          climate: 'cool, dry',
          duration: '120-150 days',
          benefits: 'Staple crop, good storage'
        },
        gram: {
          soilTypes: ['black', 'sandy', 'loamy'],
          waterRequirement: 'low',
          climate: 'cool, dry',
          duration: '90-120 days',
          benefits: 'Nitrogen fixation, protein rich'
        },
        mustard: {
          soilTypes: ['alluvial', 'sandy', 'loamy'],
          waterRequirement: 'low',
          climate: 'cool, dry',
          duration: '90-110 days',
          benefits: 'Oil crop, quick harvest'
        },
        barley: {
          soilTypes: ['sandy', 'loamy', 'saline'],
          waterRequirement: 'low',
          climate: 'cool, dry',
          duration: '90-120 days',
          benefits: 'Salt tolerant, animal feed'
        }
      },
      // Zaid crops (Summer season)
      zaid: {
        watermelon: {
          soilTypes: ['sandy', 'alluvial'],
          waterRequirement: 'moderate',
          climate: 'hot, dry',
          duration: '90-100 days',
          benefits: 'High market value in summer'
        },
        cucumber: {
          soilTypes: ['loamy', 'alluvial'],
          waterRequirement: 'moderate',
          climate: 'warm',
          duration: '50-70 days',
          benefits: 'Quick harvest, continuous yield'
        },
        fodder: {
          soilTypes: ['any'],
          waterRequirement: 'moderate',
          climate: 'warm',
          duration: '45-60 days',
          benefits: 'Animal feed, soil improvement'
        }
      }
    };

    // Regional crop preferences
    this.regionalCrops = {
      'maharashtra': ['cotton', 'sugarcane', 'rice', 'sorghum'],
      'punjab': ['wheat', 'rice', 'maize', 'cotton'],
      'uttar pradesh': ['wheat', 'rice', 'sugarcane', 'gram'],
      'rajasthan': ['bajra', 'gram', 'mustard', 'barley'],
      'gujarat': ['cotton', 'groundnut', 'wheat', 'gram'],
      'karnataka': ['rice', 'cotton', 'sugarcane', 'ragi'],
      'tamil nadu': ['rice', 'sugarcane', 'cotton', 'groundnut'],
      'andhra pradesh': ['rice', 'cotton', 'sugarcane', 'groundnut'],
      'west bengal': ['rice', 'jute', 'wheat', 'potato'],
      'bihar': ['rice', 'wheat', 'maize', 'gram']
    };
  }

  /**
   * Generate crop recommendations based on context
   * @param {string} question - Farmer's question in English
   * @param {object} context - Farmer context
   * @returns {Promise<object>} Recommendations
   */
  async generateRecommendations(question, context = {}) {
    try {
      logger.info('Generating crop recommendations', { question, context });

      // Analyze context to determine suitable crops
      const suitableCrops = this.analyzeCropSuitability(context);
      
      // Generate detailed response using AI
      const aiResponse = await this.generateAIResponse(question, context, suitableCrops);
      
      // Format recommendations
      const recommendations = this.formatRecommendations(suitableCrops, context);

      return {
        response: aiResponse,
        recommendations,
        additionalTips: this.generateAdditionalTips(context)
      };
    } catch (error) {
      logger.error('Error generating crop recommendations', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze crop suitability based on farmer context
   * @param {object} context - Farmer context
   * @returns {Array} Suitable crops with scores
   */
  analyzeCropSuitability(context) {
    const { soilType, season, location, irrigation } = context;
    const suitableCrops = [];

    // Determine season-based crops
    const seasonCrops = season ? this.cropDatabase[season] || {} : 
                      { ...this.cropDatabase.kharif, ...this.cropDatabase.rabi, ...this.cropDatabase.zaid };

    // Analyze each crop
    Object.entries(seasonCrops).forEach(([cropName, cropData]) => {
      let suitabilityScore = 0;
      const reasons = [];

      // Soil type match
      if (soilType && cropData.soilTypes.includes(soilType)) {
        suitabilityScore += 30;
        reasons.push(`Well-suited for ${soilType} soil`);
      }

      // Regional preference
      if (location) {
        const regionalCrops = this.regionalCrops[location.toLowerCase()] || [];
        if (regionalCrops.includes(cropName)) {
          suitabilityScore += 25;
          reasons.push('Popular crop in your region');
        }
      }

      // Water requirement vs irrigation
      if (irrigation) {
        if (cropData.waterRequirement === 'low' && irrigation === 'rainfed') {
          suitabilityScore += 20;
          reasons.push('Suitable for rainfed conditions');
        } else if (cropData.waterRequirement === 'high' && 
                  ['irrigated', 'drip', 'sprinkler'].includes(irrigation)) {
          suitabilityScore += 20;
          reasons.push('Good match for irrigation facilities');
        }
      }

      // Base suitability for all crops
      suitabilityScore += 15;

      if (suitabilityScore > 0) {
        suitableCrops.push({
          crop: cropName,
          suitability: suitabilityScore >= 70 ? 'high' : 
                      suitabilityScore >= 40 ? 'medium' : 'low',
          score: suitabilityScore,
          reasons,
          details: cropData
        });
      }
    });

    // Sort by suitability score
    return suitableCrops.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Generate AI response for the question
   * @param {string} question - Farmer's question
   * @param {object} context - Farmer context
   * @param {Array} suitableCrops - Suitable crops
   * @returns {Promise<string>} AI generated response
   */
  async generateAIResponse(question, context, suitableCrops) {
    // Create a comprehensive prompt for AI
    const prompt = this.createPrompt(question, context, suitableCrops);

    try {
      // Try OpenAI first if available
      if (this.openaiApiKey) {
        return await this.callOpenAI(prompt);
      }

      // Fallback to Hugging Face
      return await this.callHuggingFace(prompt);
    } catch (error) {
      logger.warn('AI response generation failed, using fallback', { error: error.message });
      return this.generateFallbackResponse(question, context, suitableCrops);
    }
  }

  /**
   * Create prompt for AI models
   * @param {string} question - Question
   * @param {object} context - Context
   * @param {Array} suitableCrops - Suitable crops
   * @returns {string} Formatted prompt
   */
  createPrompt(question, context, suitableCrops) {
    const topCrops = suitableCrops.slice(0, 3).map(crop => crop.crop).join(', ');
    
    return `You are an expert agricultural advisor for Indian farmers. 

Question: ${question}

Farmer Context:
- Location: ${context.location || 'Not specified'}
- Soil Type: ${context.soilType || 'Not specified'}
- Season: ${context.season || 'Not specified'}
- Farm Size: ${context.farmSize || 'Not specified'}
- Irrigation: ${context.irrigation || 'Not specified'}

Top Recommended Crops: ${topCrops}

Provide practical, actionable advice in 150-200 words. Include:
1. Direct answer to the question
2. Specific crop recommendations with reasons
3. Practical farming tips
4. Market considerations if relevant

Keep the tone helpful and encouraging. Focus on sustainable and profitable farming practices.`;
  }

  /**
   * Call OpenAI API
   * @param {string} prompt - Prompt text
   * @returns {Promise<string>} AI response
   */
  async callOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Call Hugging Face API
   * @param {string} prompt - Prompt text
   * @returns {Promise<string>} AI response
   */
  async callHuggingFace(prompt) {
    const model = 'microsoft/DialoGPT-large';
    const response = await axios.post(
      `${this.baseUrl}/${model}`,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text.replace(prompt, '').trim();
    }

    throw new Error('Invalid response from AI service');
  }

  /**
   * Generate fallback response when AI services fail
   * @param {string} question - Question
   * @param {object} context - Context
   * @param {Array} suitableCrops - Suitable crops
   * @returns {string} Fallback response
   */
  generateFallbackResponse(question, context, suitableCrops) {
    const topCrop = suitableCrops[0];
    
    if (!topCrop) {
      return `Based on your question about farming, I recommend consulting with local agricultural experts for specific advice tailored to your area and conditions.`;
    }

    const { crop, reasons, details } = topCrop;
    
    return `Based on your ${context.soilType || ''} soil ${context.season ? `in ${context.season} season` : ''}, I recommend growing ${crop}. ${reasons.join('. ')}. This crop typically takes ${details.duration} to mature and has ${details.waterRequirement} water requirements. ${details.benefits}. For best results, ensure proper soil preparation and follow local agricultural practices.`;
  }

  /**
   * Format crop recommendations
   * @param {Array} suitableCrops - Suitable crops
   * @param {object} context - Context
   * @returns {Array} Formatted recommendations
   */
  formatRecommendations(suitableCrops, context) {
    return suitableCrops.slice(0, 5).map(crop => ({
      crop: crop.crop.charAt(0).toUpperCase() + crop.crop.slice(1),
      suitability: crop.suitability,
      reason: crop.reasons.join(', '),
      duration: crop.details.duration,
      waterRequirement: crop.details.waterRequirement,
      benefits: crop.details.benefits
    }));
  }

  /**
   * Generate additional farming tips
   * @param {object} context - Farmer context
   * @returns {Array} Additional tips
   */
  generateAdditionalTips(context) {
    const tips = [];

    if (context.soilType === 'black') {
      tips.push('Black soil retains moisture well - avoid over-watering');
      tips.push('Consider crop rotation with legumes to maintain soil fertility');
    }

    if (context.irrigation === 'rainfed') {
      tips.push('Choose drought-resistant varieties');
      tips.push('Practice water conservation techniques like mulching');
    }

    if (context.experience === 'beginner') {
      tips.push('Start with easier crops and gradually expand');
      tips.push('Connect with local farmer groups for guidance');
    }

    tips.push('Test soil regularly for nutrient content');
    tips.push('Keep weather forecasts in mind for planning');

    return tips.slice(0, 3);
  }
}

module.exports = new CropRecommendationService();
