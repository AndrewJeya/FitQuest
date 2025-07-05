import { GoogleGenerativeAI } from "@google/generative-ai";

let GEMINI_API_KEY = '';
try {
  const env = require('@env');
  GEMINI_API_KEY = env.GEMINI_API_KEY || '';
} catch (error) {
  GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
}

export const fetchFitnessHouse = async (userData) => {
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API key");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an advanced AI fitness classifier responsible for assigning users to one of three fitness houses based on their fitness profile, goals, and preferences. Additionally, you will calculate a target BMI level and suggest a daily calorie intake based on the user's details.\n\n### **Houses & Their Core Principles:**\n🏋️ **House of Valor** (Trainer: Maximus)\n- Strength, endurance, and resilience.\n- Ideal for weightlifting, outdoor activities, and team sports.\n- Appeals to disciplined individuals who push their limits.\n\n🧘 **House of Lumina** (Trainer: Serene)\n- Flexibility, mindfulness, and holistic well-being.\n- Best for yoga, stretching, and home workouts.\n- Attracts those seeking stress relief and body balance.\n\n⚡ **House of Nova** (Trainer: Lyra)\n- Agility, HIIT, and structured progress tracking.\n- Great for fast-paced workouts, weight loss, and performance tracking.\n- Suited for those who like structured plans and measurable improvements.\n\n---\n\n### **User Data for Classification:**\n- **Name:** ${userData.name}\n- **Email:** ${userData.email}\n- **Age:** ${userData.age || "Not Provided"}\n- **Height:** ${userData.height} cm\n- **Weight:** ${userData.weight} kg\n- **BMI:** ${userData.bmi}\n- **Exercise Level:** ${userData.exercise_level}\n- **Preferences:** ${userData.preferences.join(", ")}\n\n---\n\n### **Classification Criteria:**\n1️⃣ **House of Valor:** Users interested in weightlifting, outdoor activities, and team sports.\n2️⃣ **House of Lumina:** Users who prefer yoga, flexibility, home workouts, and mindfulness.\n3️⃣ **House of Nova:** Users focused on HIIT, progress tracking, fast-paced training, and structured plans.\n4️⃣ If mixed preferences, classify based on the strongest match considering both **exercise level** and **fitness goals**.\n\n---\n\n### **Target BMI Calculation:**\n- **Underweight (BMI < 18.5):** Suggest **target BMI of 19-21** (Weight Gain).\n- **Overweight (BMI > 25):** Suggest **target BMI of 22-24** (Weight Loss).\n- **Normal BMI (18.5 - 24.9):** Suggest maintaining current BMI.\n\n### **Calorie Intake Calculation (Mifflin-St Jeor Equation):**\n\`\`\`\nBMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5\n\`\`\`\n🔥 Multiply by activity level:\n- **Sedentary:** BMR × 1.2\n- **Lightly Active:** BMR × 1.375\n- **Moderately Active:** BMR × 1.55\n- **Very Active:** BMR × 1.725\n\n**Adjust for fitness goals:**\n- **Weight Loss:** Reduce by **500 kcal/day**.\n- **Muscle Gain:** Increase by **300-500 kcal/day**.\n- **Maintenance:** Keep recommended intake.\n\n---\n\n### **Response Format (JSON):**\n\`\`\`json\n{\n  "house": "House of Nova",\n  "trainer": "Lyra",\n  "justification": "Nova focuses on agility, structure, and progress tracking.",\n  "target_bmi": 22,\n  "recommended_calories_per_day": 2200\n}\n\`\`\`\n`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const raw = result.response.text().trim();
  let jsonString = raw;
  const jsonMatch = raw.match(/```json([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1].trim();
  }
  return JSON.parse(jsonString);
};
