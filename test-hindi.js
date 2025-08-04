const axios = require('axios');

// Dynamic API base URL from environment or default
const API_BASE = process.env.API_BASE || `http://localhost:${process.env.PORT || 3000}`;

async function testHindiTranslation() {
  console.log('Testing Hindi language translation with fallback...\n');
  console.log(`API Base URL: ${API_BASE}`);
  console.log('='.repeat(50));
  
  const testData = {
    language: 'hi',
    question: 'मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?',
    farmerContext: {
      location: 'Madhya Pradesh',
      season: 'kharif',
      soilType: 'black'
    }
  };

  try {
    console.log('Sending request to API...');
    console.log('Question in Hindi:', testData.question);
    
    const response = await axios.post(`${API_BASE}/api/v1/crop-advice`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('\n✅ SUCCESS! Hindi test passed');
    console.log('Status:', response.status);
    console.log('Response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if we got recommendations
    if (response.data.recommendations && response.data.recommendations.length > 0) {
      console.log('\n📋 Recommendations received:', response.data.recommendations.length);
    }

    // Check if we got translations (even if fallback)
    if (response.data.translatedResponse) {
      console.log('\n🔄 Translation provided (may be fallback)');
    }

  } catch (error) {
    console.log('\n❌ FAILED! Hindi test failed');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testHindiTranslation();
