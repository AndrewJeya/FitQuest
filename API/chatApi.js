import axios from 'axios';

// Try to get API key from environment, fallback to empty string
let OPENAI_API_KEY = '';
try {
  const env = require('@env');
  OPENAI_API_KEY = env.OPENAI_API_KEY || '';
  console.log('API Key loaded:', OPENAI_API_KEY ? 'Yes' : 'No');
} catch (error) {
  console.log('Environment variables not loaded, using fallback responses');
}

// If no API key from env, try to use the one from the logs
if (!OPENAI_API_KEY) {
  OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  console.log('Using fallback API key');
}

const API_URL = 'https://api.openai.com/v1/chat/completions';

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
    if (!response.exerciseDetails || !response.exerciseDetails.exercise) {
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
  
  return {
    response: `Great to see you, ${userData.name}! Let's get you moving with some ${randomExercise.exercise}. This is perfect for your ${userData.house} training style. Ready to give it a try?`,
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
  };
};

export const getFitnessResponse = async (userData) => {
  // Check if API key is available
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using fallback response');
    return getFallbackResponse(userData);
  }

  console.log('Using OpenAI API with key:', OPENAI_API_KEY ? 'Available' : 'Missing');

const systemPrompt = `User Information:
- Name: ${userData.name || 'User'}
- House: ${userData.house || 'FitQuest'}
- BMI: ${userData.bmi || 'normal'}
- Height: ${userData.height || 170} cm
- Weight: ${userData.weight || 70} kg
- Exercise Level: ${userData.exerciseLevel || 'beginner'}
- Goals: ${(userData.selectedOptions && userData.selectedOptions.length > 0) ? userData.selectedOptions.join(", ") : 'general fitness'}
- Targeted Calorie Intake: ${userData.targetedCalorieIntake || 2000}

**Instructions:**
-   **Strict JSON Formatting:** Always respond in JSON format. Do not include any extra characters or text outside of the JSON object.
-   **Required Fields:** Every response must contain "response", "youtubeLink", "exerciseDetails", "dailyTasks", and "counters".
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

    // Build messages array with conversation history
    const messages = [
        { role: "system", content: systemPrompt }
    ];

    // Add conversation history if available
    if (userData.conversationHistory && userData.conversationHistory.length > 0) {
        // Limit to last 10 messages to avoid token limits
        const recentHistory = userData.conversationHistory.slice(-10);
        messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: "user", content: userData.message });

    try {
        const response = await axios.post(
            API_URL,
            {
                model: "ft:gpt-4o-mini-2024-07-18:personal:fitquest-trainers2-0:BBidYosO",
                messages: messages,
                temperature: 0.8,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (
            response.data &&
            response.data.choices &&
            response.data.choices.length > 0 &&
            response.data.choices[0].message &&
            response.data.choices[0].message.content
        ) {
            let rawContent = response.data.choices[0].message.content.trim();
            console.log('Raw OpenAI Response:', rawContent); // Log raw response

            let jsonString = rawContent;
            const jsonMatch = rawContent.match(/`json([\s\S]*?)`/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1].trim();
            }

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(jsonString);
                validateResponse(parsedResponse);
            } catch (error) {
                console.error("Error parsing/validating response:", error);
                console.error("JSON String:", jsonString); // Log the string causing the error
                throw new Error("Invalid response from model.");
            }

            const sanitizedCounters = {
                calories: isNaN(Number(parsedResponse.counters.calories)) ? 0 : Number(parsedResponse.counters.calories),
                points: isNaN(Number(parsedResponse.counters.points)) ? 0 : Number(parsedResponse.counters.points),
                tasksCompleted: isNaN(Number(parsedResponse.counters.tasksCompleted)) ? 0 : Number(parsedResponse.counters.tasksCompleted),
            };

            return {
                response: parsedResponse.response,
                youtubeLink: parsedResponse.youtubeLink ? sanitizeURL(parsedResponse.youtubeLink) : "",
                exerciseDetails: parsedResponse.exerciseDetails || {},
                dailyTasks: parsedResponse.dailyTasks || [],
                counters: sanitizedCounters,
            };
        } else {
            console.error("Unexpected OpenAI API response structure:", response.data);
            throw new Error("Unexpected API response.");
        }
    } catch (error) {
        console.error("Error fetching fitness response:", error);
        
        // Return a safe fallback response
        return {
            response: "I'm here to help with your fitness journey! What would you like to work on today?",
            youtubeLink: "",
            exerciseDetails: {
                exercise: "general fitness",
                sets: 3,
                reps: 10
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
                }
            ],
            counters: { calories: 0, points: 0, tasksCompleted: 0 },
        };
    }
};

export default validateResponse;
