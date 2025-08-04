const axios = require('axios');

// Dynamic API base URL from environment or default
const API_BASE = process.env.API_BASE || `http://localhost:${process.env.PORT || 3000}`;

async function testMultilingualProviders() {
  console.log('🌍 Testing Multilingual Translation Providers\n');
  console.log(`API Base URL: ${API_BASE}`);
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      language: 'hi',
      question: 'मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?',
      description: 'Hindi - Black soil and low rainfall question'
    },
    {
      language: 'bn',
      question: 'আমার মাটি কালো এবং বৃষ্টি কম হয়। কোন ফসল লাগাবো?',
      description: 'Bengali - Similar farming question'
    },
    {
      language: 'ta',
      question: 'என் மண் கருப்பு மற்றும் மழை குறைவு. எந்த பயிர் வளர்க்க வேண்டும்?',
      description: 'Tamil - Farming question'
    },
    {
      language: 'te',
      question: 'నా మట్టి నల్లగా ఉంది మరియు వర్షం తక్కువ. ఏ పంట పండించాలి?',
      description: 'Telugu - Farming question'
    }
  ];

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    console.log(`📝 Question: ${testCase.question}`);
    console.log(`🌐 Language: ${testCase.language}`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post(`${API_BASE}/api/v1/crop-advice`, {
        language: testCase.language,
        question: testCase.question,
        farmerContext: {
          location: 'Maharashtra',
          season: 'kharif',
          soilType: 'black'
        }
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.status === 200 && response.data.success) {
        console.log(`✅ SUCCESS! (${duration}ms)`);
        console.log(`🔄 Translated to: "${response.data.data.translatedQuestion}"`);
        console.log(`📋 Got ${response.data.data.recommendations?.length || 0} recommendations`);
        
        results.passed++;
        results.details.push({
          language: testCase.language,
          status: 'PASSED',
          duration,
          translatedQuestion: response.data.data.translatedQuestion,
          recommendationsCount: response.data.data.recommendations?.length || 0
        });
      } else {
        throw new Error(`Invalid response: ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ FAILED!`);
      console.log(`💥 Error: ${error.message}`);
      
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      results.failed++;
      results.details.push({
        language: testCase.language,
        status: 'FAILED',
        error: error.message
      });
    }
    
    console.log('-'.repeat(40));
  }

  // Summary
  console.log(`\nTEST SUMMARY`);
  console.log(`=`.repeat(30));
  console.log(`Passed: ${results.passed}/${testCases.length}`);
  console.log(`Failed: ${results.failed}/${testCases.length}`);
  console.log(`Success Rate: ${((results.passed / testCases.length) * 100).toFixed(1)}%`);

  // Detailed results
  console.log(`\n📋 DETAILED RESULTS:`);
  results.details.forEach((result, index) => {
    console.log(`${index + 1}. ${result.language.toUpperCase()}: ${result.status}`);
    if (result.status === 'PASSED') {
      console.log(`   ⏱️  Duration: ${result.duration}ms`);
      console.log(`   📝 Translation: "${result.translatedQuestion}"`);
      console.log(`   📋 Recommendations: ${result.recommendationsCount}`);
    } else {
      console.log(`   💥 Error: ${result.error}`);
    }
  });

  // Test provider fallback system
  console.log(`\n🔄 Testing Provider Fallback System...`);
  try {
    const response = await axios.get(`${API_BASE}/api/v1/crop-advice/languages`);
    console.log(`✅ Supported languages: ${response.data.data.length} languages`);
    console.log(`📋 Languages: ${response.data.data.map(l => l.code).join(', ')}`);
  } catch (error) {
    console.log(`❌ Failed to get supported languages: ${error.message}`);
  }

  console.log(`\n🎯 CONCLUSION:`);
  if (results.passed === testCases.length) {
    console.log(`🎉 ALL TESTS PASSED! Multilingual system is working perfectly!`);
  } else if (results.passed > 0) {
    console.log(`⚠️  PARTIAL SUCCESS: ${results.passed}/${testCases.length} languages working.`);
    console.log(`🔧 Some providers might need adjustment or fallback is being used.`);
  } else {
    console.log(`🚨 ALL TESTS FAILED! Translation system needs immediate attention.`);
  }
}

// Run the comprehensive test
testMultilingualProviders().catch(console.error);
