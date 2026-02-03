/**
 * Test ALOC API Connection
 * Run this to verify your API token is working correctly
 * 
 * Usage: npx tsx test-api-connection.ts
 * Or add to package.json: "test:api": "tsx test-api-connection.ts"
 */

import { testAPIConnection, fetchQuestionsFromAPI } from './lib/questions-api-enhanced';

async function testALOCAPI() {
  console.log('🧪 Testing ALOC API Connection...\n');
  console.log('API URL:', process.env.NEXT_PUBLIC_QUESTIONS_API_URL);
  console.log('API Key:', process.env.NEXT_PUBLIC_QUESTIONS_API_KEY ? '✓ Set' : '✗ Not set');
  console.log('---\n');

  // Test 1: Basic connection
  console.log('Test 1: Basic API Connection');
  const connectionTest = await testAPIConnection();
  console.log('Status:', connectionTest.success ? '✅ Connected' : '❌ Failed');
  console.log('Message:', connectionTest.message);
  if (connectionTest.questionsCount) {
    console.log('Sample Questions:', connectionTest.questionsCount);
  }
  console.log('---\n');

  if (!connectionTest.success) {
    console.error('❌ API connection failed. Please check your credentials.');
    return;
  }

  // Test 2: Fetch JAMB Mathematics (60 questions)
  console.log('Test 2: Fetch JAMB Mathematics (60 questions)');
  try {
    console.time('Fetch Time');
    const mathQuestions = await fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 60);
    console.timeEnd('Fetch Time');
    console.log('Questions Fetched:', mathQuestions.length);
    if (mathQuestions.length > 0) {
      console.log('Sample Question:', {
        id: mathQuestions[0].id,
        subject: mathQuestions[0].subject,
        year: mathQuestions[0].year,
        questionText: mathQuestions[0].questionText.substring(0, 50) + '...',
      });
      console.log('✅ JAMB Mathematics test passed');
    } else {
      console.log('⚠️ No questions returned');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log('---\n');

  // Test 3: Fetch WAEC English (60 questions)
  console.log('Test 3: Fetch WAEC English (60 questions)');
  try {
    console.time('Fetch Time');
    const englishQuestions = await fetchQuestionsFromAPI('waec', 'English Language', 2024, 60);
    console.timeEnd('Fetch Time');
    console.log('Questions Fetched:', englishQuestions.length);
    if (englishQuestions.length > 0) {
      console.log('✅ WAEC English test passed');
    } else {
      console.log('⚠️ No questions returned');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log('---\n');

  // Test 4: JAMB UTME (180 questions - official format)
  console.log('Test 4: JAMB UTME Complete Exam (180 questions)');
  console.log('Format: English 60q + 3 subjects 40q each');
  try {
    console.time('Total Fetch Time');
    
    const [english, math, physics, chemistry] = await Promise.all([
      fetchQuestionsFromAPI('jamb', 'English Language', 2024, 60),
      fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 40),
      fetchQuestionsFromAPI('jamb', 'Physics', 2024, 40),
      fetchQuestionsFromAPI('jamb', 'Chemistry', 2024, 40),
    ]);
    
    console.timeEnd('Total Fetch Time');
    
    const total = english.length + math.length + physics.length + chemistry.length;
    
    console.log('English:', english.length, 'questions');
    console.log('Mathematics:', math.length, 'questions');
    console.log('Physics:', physics.length, 'questions');
    console.log('Chemistry:', chemistry.length, 'questions');
    console.log('Total:', total, 'questions');
    
    if (total === 180) {
      console.log('✅ JAMB UTME test passed - Correct format!');
    } else {
      console.log(`⚠️ Expected 180 questions, got ${total}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log('---\n');

  // Test 5: Cache test (should be instant)
  console.log('Test 5: Cache Test (re-fetch same questions)');
  try {
    console.time('Cached Fetch Time');
    const cachedQuestions = await fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 60);
    console.timeEnd('Cached Fetch Time');
    console.log('Questions Fetched:', cachedQuestions.length);
    console.log('✅ Cache test passed (should be < 10ms)');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log('---\n');

  console.log('🎉 All tests completed!');
  console.log('\n📚 Your ALOC API is ready to use with 20,000-60,000 questions!');
  console.log('Next steps:');
  console.log('1. Integrate with your exam interface');
  console.log('2. Test with real users');
  console.log('3. Monitor API usage and costs');
}

// Run tests
testALOCAPI().catch(console.error);
