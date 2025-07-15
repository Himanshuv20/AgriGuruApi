const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Test script to demo the API functionality
async function runAPIDemo() {
  console.log('🌾 AgriGuru API Demo\n');

  try {
    // Test 1: Basic English request
    console.log('1. Testing English crop advice...');
    const englishRequest = {
      question: "I have black soil and limited water supply. Which crop should I grow in the monsoon season?",
      language: "en",
      farmerContext: {
        location: "Maharashtra",
        soilType: "black",
        season: "kharif",
        farmSize: "2 acres",
        irrigation: "rainfed"
      }
    };

    const englishResponse = await axios.post(`${API_BASE}/api/v1/crop-advice`, englishRequest);

    console.log('✅ English Response Status:', englishResponse.status);
    if (englishResponse.data.success) {
      console.log('📝 Response:', englishResponse.data.data.englishResponse.substring(0, 150) + '...');
      console.log('🌱 Top Recommendation:', englishResponse.data.data.recommendations[0]?.crop);
    } else {
      console.log('❌ Error:', englishResponse.data.error);
    }

    // Test 2: Validation test
    console.log('\n2. Testing validation with invalid request...');
    const invalidRequest = {
      question: "Hi", // Too short
      language: "invalid" // Invalid language
    };

    try {
      await axios.post(`${API_BASE}/api/v1/crop-advice`, invalidRequest);
    } catch (error) {
      const validationResponse = error.response;
      console.log('✅ Validation Response Status:', validationResponse.status);
      console.log('📝 Validation Errors:', validationResponse.data.error?.details?.length || 0, 'fields');
    }

    // Test 3: Support endpoints
    console.log('\n3. Testing support endpoints...');
    
    const languagesResponse = await axios.get(`${API_BASE}/api/v1/crop-advice/languages`);
    console.log('✅ Languages Endpoint:', languagesResponse.status, '- Found', languagesResponse.data.data?.total, 'languages');

    const soilTypesResponse = await axios.get(`${API_BASE}/api/v1/crop-advice/soil-types`);
    console.log('✅ Soil Types Endpoint:', soilTypesResponse.status, '- Found', soilTypesResponse.data.data?.total, 'soil types');

    const seasonsResponse = await axios.get(`${API_BASE}/api/v1/crop-advice/seasons`);
    console.log('✅ Seasons Endpoint:', seasonsResponse.status, '- Found', seasonsResponse.data.data?.total, 'seasons');

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📚 Next Steps:');
    console.log('1. Add your Hugging Face API key to .env file');
    console.log('2. Test with different languages (Hindi, Bengali, Tamil, etc.)');
    console.log('3. Try different farming scenarios and contexts');
    console.log('4. Deploy to production with proper API keys');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }

  process.exit(0);
}

runAPIDemo();
