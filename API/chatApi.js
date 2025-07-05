import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { decode as atob } from 'base-64';

// Try to get Gemini API key from environment, fallback to empty string
let GEMINI_API_KEY = '';
try {
  const env = require('@env');
  GEMINI_API_KEY = env.GEMINI_API_KEY || '';
} catch (error) {
  GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
}

const validateResponse = (response) => {
    if (!response || typeof response !== "object") {
        throw new Error("Invalid response object.");
    }
    if (!response.response) {
        throw new Error("Missing response text.");
    }
    // Improved YouTube link validation - more flexible
    if (response.youtubeLink && typeof response.youtubeLink !== 'string') {
        throw new Error("YouTube link must be a string.");
    }
    if (response.youtubeLink && response.youtubeLink !== "null" && response.youtubeLink !== "") {
        // Check if it's a valid YouTube URL (more flexible)
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
        if (!youtubeRegex.test(response.youtubeLink)) {
            console.warn("Potentially invalid YouTube link:", response.youtubeLink);
            // Don't throw error, just warn and continue
        }
    }
    if (!response.exerciseDetails || (!response.exerciseDetails.exercise && !response.exerciseDetails.name)) {
        throw new Error("Missing exercise details.");
    }
    if (!response.counters) {
        throw new Error("Missing counters object.");
    }
    return true;
};

const sanitizeURL = (url) => {
  if (!url) return "";
  try {
    new URL(url);
    return url;
  } catch (_) {
    return "";
  }
};

// Enhanced fallback responses with better personalization
const getFallbackResponse = (userData) => {
  const exercises = [
    {
      exercise: "Push-ups",
      sets: 3,
      reps: 10,
      youtubeLink: "https://www.youtube.com/watch?v=IODxDxX7oi4",
      difficulty: "beginner"
    },
    {
      exercise: "Squats",
      sets: 3,
      reps: 15,
      youtubeLink: "https://www.youtube.com/watch?v=aclHkVaku9U",
      difficulty: "beginner"
    },
    {
      exercise: "Jumping Jacks",
      sets: 3,
      reps: 20,
      youtubeLink: "https://www.youtube.com/watch?v=1b98WrRrmkQ",
      difficulty: "beginner"
    },
    {
      exercise: "Plank",
      sets: 3,
      reps: "30 seconds",
      youtubeLink: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
      difficulty: "beginner"
    }
  ];

  const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
  
  // Personalized response based on house
  const houseResponses = {
    Nova: `Welcome to the House of Nova, ${userData.name}! We focus on balanced fitness and sustainable progress. Let's start with some ${randomExercise.exercise} to build your foundation.`,
    Valor: `Greetings, ${userData.name}! In the House of Valor, we embrace strength and determination. ${randomExercise.exercise} will help you build the warrior within.`,
    Lumina: `Hello ${userData.name}! Welcome to the House of Lumina, where we cultivate inner strength and mindfulness. Let's begin with ${randomExercise.exercise} to center your energy.`
  };
  
  return {
    response: houseResponses[userData.house] || `Great to see you, ${userData.name}! Let's get you moving with some ${randomExercise.exercise}. This is perfect for your ${userData.house} training style. Ready to give it a try?`,
    youtubeLink: randomExercise.youtubeLink,
    exerciseDetails: {
      exercise: randomExercise.exercise,
      sets: randomExercise.sets,
      reps: randomExercise.reps,
      difficulty: randomExercise.difficulty
    },
    dailyTasks: [
      {
        time: "8:00 AM",
        emoji: "💧",
        title: "Drink water",
        points: 5,
        category: "hydration"
      },
      {
        time: "10:00 AM",
        emoji: "🏃‍♂️",
        title: "Take a walk",
        points: 10,
        category: "cardio"
      },
      {
        time: "12:00 PM",
        emoji: "🥗",
        title: "Eat a healthy lunch",
        points: 5,
        category: "nutrition"
      },
      {
        time: "3:00 PM",
        emoji: "🧘‍♀️",
        title: "Stretch break",
        points: 5,
        category: "flexibility"
      },
      {
        time: "6:00 PM",
        emoji: "🏋️‍♂️",
        title: "Evening workout",
        points: 15,
        category: "strength"
      }
    ],
    counters: { calories: 0, points: 5, tasksCompleted: 0 },
  };
};

// Helper: Convert OpenAI-style messages to Gemini format
const toGeminiHistory = (messages) => {
  return messages.map(msg => {
    if (msg.role === 'system') {
      return { role: 'model', parts: [{ text: msg.content }] };
    } else if (msg.role === 'user') {
      return { role: 'user', parts: [{ text: msg.content }] };
    } else if (msg.role === 'assistant') {
      return { role: 'model', parts: [{ text: msg.content }] };
    }
    return null;
  }).filter(Boolean);
};

// Helper: Convert base64 image to Gemini part
const imageToGeminiPart = (base64, mimeType = 'image/jpeg') => ({ inlineData: { data: base64, mimeType } });

// Enhanced system prompt with better personalization
const createSystemPrompt = (userData) => {
  const houseStyles = {
    Nova: "balanced, sustainable, and progressive approach to fitness",
    Valor: "intense, strength-focused, and warrior-like training methods",
    Lumina: "mindful, holistic, and energy-centered fitness practices"
  };

  const exerciseLevelGuidance = {
    beginner: "focus on form and building foundational strength",
    intermediate: "challenge with moderate intensity and variety",
    advanced: "push limits with high-intensity and complex movements"
  };

  return `You are an AI fitness trainer for the House of ${userData.house}, specializing in ${houseStyles[userData.house] || "personalized fitness training"}.

User Profile:
- Name: ${userData.name || 'User'}
- House: ${userData.house || 'FitQuest'}
- BMI: ${userData.bmi || 'normal'}
- Height: ${userData.height || 170} cm
- Weight: ${userData.weight || 70} kg
- Exercise Level: ${userData.exerciseLevel || 'beginner'} (${exerciseLevelGuidance[userData.exerciseLevel] || "focus on form and building foundational strength"})
- Goals: ${(userData.selectedOptions && userData.selectedOptions.length > 0) ? userData.selectedOptions.join(", ") : 'general fitness'}
- Daily Calorie Target: ${userData.targetedCalorieIntake || userData.recommended_calories_per_day || 2000}
- Current Points: ${userData.currentPoints || 0}
- Current Tasks: ${userData.currentTasks ? userData.currentTasks.length : 0} active tasks

**Instructions:**
- **Strict JSON Formatting:** Always respond in JSON format. Do not include any extra characters or text outside of the JSON object.
- **Required Fields:** Every response must contain "response", "youtubeLink", "exerciseDetails", "dailyTasks", and "counters".
- **Exercise Details:** Provide only **one exercise** at a time, including **sets, reps, difficulty level, and a valid YouTube tutorial link**.
- **YouTube Tutorial Links:** When providing exercise tutorials, search for and include a working YouTube link that shows proper form for the exercise. Use this format: "https://www.youtube.com/watch?v=VIDEO_ID"
- **Daily Task Management:** Generate a full **daily task list** aligned with ${userData.name}'s fitness goals. Each task should be an object with "time", "emoji", "title", "points", and "category" properties.
- **Calorie, Points, and Task Tracking:**
  - Track calories based on meals logged.
  - Update points for completing exercises and healthy meal choices.
  - Display tasks completed vs. total tasks.
- **Meal Verification:** After completing required workouts or at intervals, prompt ${userData.name} to present their meal for verification.
- **Motivational Engagement:** Keep responses engaging, personalized, and inspiring based on ${userData.name}'s house and fitness journey.
- **User Inquiry Handling:** Answer all user questions concisely and **only** within the scope of fitness, exercise, and health.
- **Conversation Context:** Remember the conversation history and respond appropriately to follow-up questions and context.
- **Tutorial Requests:** When users ask for tutorials or help with exercises, provide a working YouTube link that demonstrates proper form for that specific exercise.

**House-Specific Guidelines:**
- **Nova:** Emphasize balanced progress, sustainable habits, and gradual improvement
- **Valor:** Focus on strength, intensity, and pushing physical limits
- **Lumina:** Highlight mindfulness, energy flow, and holistic wellness

Follow these instructions strictly while ensuring a smooth, structured, and engaging experience for the user.`;
};

export const getFitnessResponse = async (userData) => {
  // Only Gemini is supported now
  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      
      // Build enhanced system prompt
      const systemPrompt = createSystemPrompt(userData);
      
      // Build history with better context
      let history = [{ role: 'model', parts: [{ text: systemPrompt }] }];
      if (userData.conversationHistory && userData.conversationHistory.length > 0) {
        const recentHistory = userData.conversationHistory.slice(-10).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));
        history = history.concat(recentHistory);
      }
      
      // Add user message
      let userParts = [{ text: userData.message }];
      // If mealImage is present, add as image part
      if (userData.mealImage) {
        // mealImage should be base64 string (no data: prefix)
        userParts.push(imageToGeminiPart(userData.mealImage));
      }
      history.push({ role: 'user', parts: userParts });
      
      // Send to Gemini with timeout
      console.log('Gemini Request:', history);
      const result = await Promise.race([
        model.generateContent({ contents: history }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);
      
      const raw = result.response.text().trim();
      
      // Try to extract JSON from anywhere in the response
      let jsonString = raw;
      // Try to match ```json ... ``` or { ... }
      const jsonMatch = raw.match(/```json([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      } else {
        // Try to find the first { ... } block
        const curlyMatch = raw.match(/\{[\s\S]*\}/);
        if (curlyMatch) {
          jsonString = curlyMatch[0];
        }
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonString);
        validateResponse(parsedResponse);
      } catch (error) {
        console.error("Gemini: Error parsing/validating response:", error);
        console.error("Gemini: JSON String:", jsonString);
        console.error("Gemini: Raw Gemini response:", raw);
        // fallback to local fallback response
        return getFallbackResponse(userData);
      }
      
      const sanitizedCounters = {
        calories: isNaN(Number(parsedResponse.counters.calories)) ? 0 : Number(parsedResponse.counters.calories),
        points: isNaN(Number(parsedResponse.counters.points)) ? 0 : Number(parsedResponse.counters.points),
        tasksCompleted: isNaN(Number(parsedResponse.counters.tasksCompleted)) ? 0 : Number(parsedResponse.counters.tasksCompleted),
      };
      
      // Normalize exerciseDetails and youtubeLink
      const exerciseDetails = parsedResponse.exerciseDetails || {};
      const exerciseName = exerciseDetails.exercise || exerciseDetails.name || '';
      const sets = exerciseDetails.sets || '';
      const reps = exerciseDetails.reps || '';
      const difficulty = exerciseDetails.difficulty || 'medium';
      
      const normalizedExerciseDetails = {
        exercise: exerciseName,
        sets: sets,
        reps: reps,
        difficulty: difficulty
      };
      
      const youtubeLink = sanitizeURL(parsedResponse.youtubeLink || '');
      
      // Enhanced daily tasks with better structure
      const dailyTasks = (parsedResponse.dailyTasks || []).map((task, index) => ({
        id: `task_${Date.now()}_${index}`,
        time: task.time || '9:00 AM',
        emoji: task.emoji || '💪',
        title: task.title || 'Complete task',
        points: task.points || 5,
        category: task.category || 'general',
        difficulty: task.difficulty || 'medium',
        completed: false
      }));
      
      return {
        response: parsedResponse.response,
        youtubeLink: youtubeLink,
        exerciseDetails: normalizedExerciseDetails,
        dailyTasks: dailyTasks,
        counters: sanitizedCounters,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return getFallbackResponse(userData);
    }
  } else {
    console.warn("No Gemini API key found, using fallback response");
    return getFallbackResponse(userData);
  }
};

export default validateResponse;
