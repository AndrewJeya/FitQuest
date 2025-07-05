// Test file to verify Gemini API integration
import { getFitnessResponse } from './API/chatApi.js';

const testUserData = {
  name: "Test User",
  age: "25",
  email: "test@example.com",
  height: "170",
  weight: "70",
  bmi: "24.2",
  exercise_level: "beginner",
  preferences: ["Quick & effective workouts", "Strength training all the way"],
  message: "Hello, I'm ready to start my fitness journey!"
};

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API integration...');
  
  try {
    const response = await getFitnessResponse(testUserData);
    console.log('✅ Gemini API Response:', JSON.stringify(response, null, 2));
    
    // Verify required fields
    const requiredFields = ['response', 'youtubeLink', 'exerciseDetails', 'dailyTasks', 'counters', 'house'];
    const missingFields = requiredFields.filter(field => !response[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing fields:', missingFields);
    } else {
      console.log('✅ All required fields present');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Gemini API Test Failed:', error);
    return null;
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testGeminiAPI();
}

export { testGeminiAPI }; 