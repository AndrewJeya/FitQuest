// Gemini API configuration and chat functionality
import { GEMINI_API_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function fetchGeminiChatResponse(message, context) {
  if (!genAI) {
    console.log('No Gemini API key found, using fallback response');
    return { response: 'Sorry, there was an error with the Gemini AI.' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    return { response: response.text() };
} catch (error) {
    console.error('Gemini API error:', error);
    return { response: 'Sorry, there was an error with the Gemini AI.' };
  }
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
    if (!response.exerciseDetails) {
        throw new Error("Missing exercise details.");
    }
    // Check for either 'exercise' or 'name' field in exerciseDetails
    if (!response.exerciseDetails.exercise && !response.exerciseDetails.name) {
        throw new Error("Missing exercise name in exercise details.");
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

// Fallback responses for when API is not available
const getFallbackResponse = (userData) => {
  const exercises = [
    {
      exercise: "Push-ups",
      sets: 3,
      reps: 10,
      youtubeLink: "https://www.youtube.com/watch?v=IODxDxX7oi4"
    },
    {
      exercise: "Squats",
      sets: 3,
      reps: 15,
      youtubeLink: "https://www.youtube.com/watch?v=aclHkVaku9U"
    },
    {
      exercise: "Jumping Jacks",
      sets: 3,
      reps: 20,
      youtubeLink: "https://www.youtube.com/watch?v=1b98WrRrmkQ"
    },
    {
      exercise: "Plank",
      sets: 3,
      reps: "30 seconds",
      youtubeLink: "https://www.youtube.com/watch?v=ASdvN_XEl_c"
    }
  ];

  const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
  
  // Generate a more descriptive fallback justification
  let fallbackJustification = `Based on your preferences and fitness goals, we've selected a house that will best support your journey. Here, you'll find a community and training style that matches your unique strengths and aspirations. Let's get started!`;
  
  return {
    response: `Great to see you, ${userData.name}! Let's get you moving with some ${randomExercise.exercise}. This is perfect for your fitness journey. Ready to give it a try?`,
    youtubeLink: randomExercise.youtubeLink,
    exerciseDetails: {
      exercise: randomExercise.exercise,
      sets: randomExercise.sets,
      reps: randomExercise.reps
    },
    dailyTasks: [
      {
        time: "8:00 AM",
        emoji: "💧",
        title: "Drink water"
      },
      {
        time: "10:00 AM",
        emoji: "🏃‍♂️",
        title: "Take a walk"
      },
      {
        time: "12:00 PM",
        emoji: "🥗",
        title: "Eat a healthy lunch"
      },
      {
        time: "3:00 PM",
        emoji: "🧘‍♀️",
        title: "Stretch break"
      },
      {
        time: "6:00 PM",
        emoji: "🏋️‍♂️",
        title: "Evening workout"
      }
    ],
    counters: { calories: 0, points: 5, tasksCompleted: 0 },
    house: "FitQuest", // Default house for fallback
    justification: fallbackJustification,
  };
};

export const getFitnessResponse = async (userData) => {
  // Check if API key is available
  if (!genAI) {
    console.log('No Gemini API key found, using fallback response');
    return getFallbackResponse(userData);
  }

  console.log('Using Gemini API');

const systemPrompt = `User Information:
- Name: ${userData.name || 'User'}
- BMI: ${userData.bmi || 'normal'}
- Height: ${userData.height || 170} cm
- Weight: ${userData.weight || 70} kg
- Exercise Level: ${userData.exerciseLevel || 'beginner'}
- Goals: ${(userData.selectedOptions && userData.selectedOptions.length > 0) ? userData.selectedOptions.join(", ") : 'general fitness'}
- Targeted Calorie Intake: ${userData.targetedCalorieIntake || 2000}

**Instructions:**
-   **Strict JSON Formatting:** Always respond in JSON format. Do not include any extra characters or text outside of the JSON object.
-   **Required Fields:** Every response must contain "response", "youtubeLink", "exerciseDetails", "dailyTasks", "counters", "house", and **a detailed, motivational, and personalized 'justification' field**. The justification should explain why the user was assigned to this house, referencing their preferences and goals in a positive and encouraging way.
-   **House Assignment:** Based on the user's preferences and fitness goals, assign them to one of these houses:
    - "House of Lumina" (for users focused on flexibility, yoga, mindfulness)
    - "House of Nova" (for users focused on cardio, endurance, high energy)
    - "House of Valor" (for users focused on strength training, muscle building)
-   **Exercise Details:** Provide only **one exercise** at a time, including **sets, reps, and a valid YouTube tutorial link**.
-   **YouTube Tutorial Links:** When providing exercise tutorials, search for and include a working YouTube link that shows proper form for the exercise. Use this format: "https://www.youtube.com/watch?v=VIDEO_ID"
-   **Daily Task and Calorie Management:** Generate a full **daily task list** aligned with ${userData.name}'s fitness goals.  Each task should be an object with a "time", "emoji", and "title" property.  For example:
    -   \`dailyTasks: [
            { time: "8:00 AM", emoji: "🍳", title: "Log breakfast" },
            { time: "9:00 AM", emoji: "🏋️‍♂️", title: "Run 2KM" },
            { time: "11:00 AM", emoji: "💧", title: "Drink water" },
            // ... other tasks
        ]\`
    Include a relevant emoji and time of day for each task.  Ensure the time is in "HH:MM AM/PM" format.
-   **Calorie, Points, and Task Tracking:**
    -   Track calories based on meals logged.
    -   Update points for completing exercises and healthy meal choices.
    -   Display tasks completed vs. total tasks.
-   **Meal Verification:**
    -   **After completing required workouts or at intervals, prompt ${userData.name} to present their meal for verification.**
    -   If a meal is not provided, suggest options to meet their calorie target.
    -   Adjust calorie count based on logged meals.
-   **Motivational Engagement:**
    -   Keep responses engaging, personalized, and inspiring based on ${userData.name}'s house and fitness journey.
    -   Acknowledge progress and push for consistency.
-   **User Inquiry Handling:** Answer all user questions concisely and **only** within the scope of fitness, exercise, and health.
-   **Conversation Context:** Remember the conversation history and respond appropriately to follow-up questions and context.
-   **Tutorial Requests:** When users ask for tutorials or help with exercises, provide a working YouTube link that demonstrates proper form for that specific exercise.

Follow these instructions strictly while ensuring a smooth, structured, and engaging experience for the user.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Build the prompt with conversation history
    let fullPrompt = systemPrompt;

    // Add conversation history if available
    if (userData.conversationHistory && userData.conversationHistory.length > 0) {
        // Limit to last 10 messages to avoid token limits
        const recentHistory = userData.conversationHistory.slice(-10);
      fullPrompt += "\n\nConversation History:\n";
      recentHistory.forEach(msg => {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      });
    }

    // Add current user message
    fullPrompt += `\n\nUser: ${userData.message || "Hello, I'm ready to start my fitness journey!"}`;
    fullPrompt += "\n\nPlease respond with a valid JSON object containing all required fields.";

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const rawContent = response.text().trim();
    
    console.log('Raw Gemini Response:', rawContent);

    // Parse JSON response - try direct parsing first, then extract from code blocks if needed
    let parsedResponse;
    try {
      // First, try to parse the raw content directly as JSON
      parsedResponse = JSON.parse(rawContent);
    } catch (directParseError) {
      console.log("Direct JSON parsing failed, trying to extract from code blocks...");
      
      // If direct parsing fails, try to extract JSON from code blocks
            let jsonString = rawContent;
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1].trim();
      } else {
        // Try to find JSON object without code blocks
        const jsonObjectMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonString = jsonObjectMatch[0];
        }
      }
      
            try {
                parsedResponse = JSON.parse(jsonString);
      } catch (extractParseError) {
        console.error("Error parsing/validating response:", extractParseError);
        console.error("Raw Content:", rawContent);
        console.error("Extracted JSON String:", jsonString);
        throw new Error("Invalid response from Gemini model.");
      }
    }
    
    // Validate the parsed response
    try {
                validateResponse(parsedResponse);
    } catch (validationError) {
      console.error("Response validation failed:", validationError);
      console.error("Parsed Response:", parsedResponse);
      throw new Error("Invalid response structure from Gemini model.");
            }

            const sanitizedCounters = {
                calories: isNaN(Number(parsedResponse.counters.calories)) ? 0 : Number(parsedResponse.counters.calories),
                points: isNaN(Number(parsedResponse.counters.points)) ? 0 : Number(parsedResponse.counters.points),
                tasksCompleted: isNaN(Number(parsedResponse.counters.tasksCompleted)) ? 0 : Number(parsedResponse.counters.tasksCompleted),
            };

    // Normalize exerciseDetails to use consistent field names
    const normalizedExerciseDetails = {
      exercise: parsedResponse.exerciseDetails?.exercise || parsedResponse.exerciseDetails?.name || "general fitness",
      sets: parsedResponse.exerciseDetails?.sets || 3,
      reps: parsedResponse.exerciseDetails?.reps || 10,
      description: parsedResponse.exerciseDetails?.description || ""
    };

            return {
                response: parsedResponse.response,
      youtubeLink: parsedResponse.youtubeLink ? sanitizeURL(parsedResponse.youtubeLink) : "",
      exerciseDetails: normalizedExerciseDetails,
                dailyTasks: parsedResponse.dailyTasks || [],
                counters: sanitizedCounters,
      house: parsedResponse.house || "FitQuest", // Ensure house is always present
            };
    } catch (error) {
        console.error("Error fetching fitness response:", error);
        
        // Return a safe fallback response
    return getFallbackResponse(userData);
    }
};

export async function analyzeMealPhoto(mealData, userInfo) {
  if (!genAI) {
    console.log('No Gemini API key found, using fallback meal analysis');
    return {
      approved: true,
      estimatedCalories: 400,
      feedback: "Thanks for logging your meal! Keep up the great work.",
      suggestions: "Continue making healthy choices throughout the day."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const mealPrompt = `You are a fitness trainer analyzing a user's meal photo. 

User Information:
- Name: ${userInfo.name || 'User'}
- Meal: ${mealData.task.title} at ${mealData.task.time}
- Target Calories: ${userInfo.targetedCalorieIntake || 2000} per day

CRITICAL: You must respond with ONLY a valid JSON object. No other text, no markdown, no explanations.

Required JSON format:
{
  "approved": true,
  "estimatedCalories": 450,
  "feedback": "Great choice! This looks like a healthy meal.",
  "suggestions": "Consider adding more vegetables next time."
}

Rules:
- "approved" must be true or false (be encouraging, approve most meals)
- "estimatedCalories" must be a number between 0-2000
- "feedback" should be encouraging and specific (max 100 characters)
- "suggestions" should be constructive advice (max 100 characters)
- Respond with ONLY the JSON object, nothing else`;

    const result = await model.generateContent(mealPrompt);
    const response = await result.response;
    const rawContent = response.text().trim();
    
    console.log('Raw meal analysis response:', rawContent);

    // Try multiple parsing strategies
    let parsedResponse = null;
    
    // Strategy 1: Direct JSON parsing
    try {
      parsedResponse = JSON.parse(rawContent);
    } catch (error) {
      console.log('Direct JSON parsing failed, trying extraction...');
    }
    
    // Strategy 2: Extract JSON from response
    if (!parsedResponse) {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.log('JSON extraction failed');
        }
      }
    }
    
    // Strategy 3: Fallback response
    if (!parsedResponse) {
      console.log('Using fallback meal analysis');
      parsedResponse = {
        approved: true,
        estimatedCalories: 400,
        feedback: "Thanks for logging your meal! Keep up the great work.",
        suggestions: "Continue making healthy choices throughout the day."
      };
    }
    
    // Validate and sanitize the response
    return {
      approved: Boolean(parsedResponse.approved),
      estimatedCalories: Math.max(0, Math.min(2000, Number(parsedResponse.estimatedCalories) || 400)),
      feedback: String(parsedResponse.feedback || "Great job logging your meal!"),
      suggestions: String(parsedResponse.suggestions || "Keep making healthy choices!")
    };
    
  } catch (error) {
    console.error('Error analyzing meal photo:', error);
    return {
      approved: true,
      estimatedCalories: 400,
      feedback: "Thanks for logging your meal! Keep up the great work.",
      suggestions: "Continue making healthy choices throughout the day."
    };
  }
}

export default validateResponse;
