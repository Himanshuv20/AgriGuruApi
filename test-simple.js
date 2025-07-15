const axios = require('axios');

async function testMultilingualProviders() {
  console.log('Testing Multilingual Translation Providers\n');
  console.log('='.repeat(60));
  
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
    }
  ];

  const results = { passed: 0, failed: 0, details: [] };

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.description}`);
    console.log(`Question: ${testCase.question}`);
    console.log(`Language: ${testCase.language}`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post('http://localhost:3000/api/v1/crop-advice', {
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
        console.log(`SUCCESS! (${duration}ms)`);
        console.log(`Translated to: "${response.data.data.translatedQuestion}"`);
        console.log(`Got ${response.data.data.recommendations?.length || 0} recommendations`);
        results.passed++;
      } else {
        throw new Error(`Invalid response: ${response.status}`);
      }

    } catch (error) {
      console.log(`FAILED!`);
      console.log(`Error: ${error.message}`);
      results.failed++;
    }
    
    console.log('-'.repeat(40));
  }

  console.log(`\nTEST SUMMARY`);
  console.log(`Passed: ${results.passed}/${testCases.length}`);
  console.log(`Failed: ${results.failed}/${testCases.length}`);
  console.log(`Success Rate: ${((results.passed / testCases.length) * 100).toFixed(1)}%`);

  if (results.passed === testCases.length) {
    console.log(`\nALL TESTS PASSED! Multilingual system is working!`);
  } else if (results.passed > 0) {
    console.log(`\nPARTIAL SUCCESS: ${results.passed}/${testCases.length} languages working.`);
  } else {
    console.log(`\nALL TESTS FAILED! Translation system needs attention.`);
  }
}

testMultilingualProviders().catch(console.error);
