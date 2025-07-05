// Exercise API Service using Free Exercise Database API
// https://yuhonas.github.io/free-exercise-db/

const API_BASE_URL = 'https://exercisedb.p.rapidapi.com';

// You'll need to get a free API key from RapidAPI
// https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/

export class ExerciseApiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = API_BASE_URL;
  }

  // Get all exercises
  async getAllExercises() {
    try {
      const response = await fetch(`${this.baseURL}/exercises`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all exercises:', error);
      return [];
    }
  }

  // Get exercises by body part
  async getExercisesByBodyPart(bodyPart) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/bodyPart/${bodyPart}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching exercises for ${bodyPart}:`, error);
      return [];
    }
  }

  // Get exercise by ID
  async getExerciseById(id) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/exercise/${id}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching exercise ${id}:`, error);
      return null;
    }
  }

  // Get exercises by target muscle
  async getExercisesByTarget(target) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/target/${target}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching exercises for target ${target}:`, error);
      return [];
    }
  }

  // Get exercises by equipment
  async getExercisesByEquipment(equipment) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/equipment/${equipment}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching exercises for equipment ${equipment}:`, error);
      return [];
    }
  }

  // Get body parts list
  async getBodyParts() {
    try {
      const response = await fetch(`${this.baseURL}/exercises/bodyPartList`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching body parts:', error);
      return [];
    }
  }

  // Get target muscles list
  async getTargetMuscles() {
    try {
      const response = await fetch(`${this.baseURL}/exercises/targetList`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching target muscles:', error);
      return [];
    }
  }

  // Get equipment list
  async getEquipmentList() {
    try {
      const response = await fetch(`${this.baseURL}/exercises/equipmentList`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching equipment list:', error);
      return [];
    }
  }

  // Search exercises by name
  async searchExercises(query) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/name/${query}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error searching exercises for "${query}":`, error);
      return [];
    }
  }
}

// Fallback exercise data (in case API is unavailable)
export const FALLBACK_EXERCISES = [
  {
    id: "0001",
    name: "Push-ups",
    bodyPart: "chest",
    target: "pectoralis major",
    equipment: "body weight",
    gifUrl: "https://example.com/pushup.gif",
    instructions: [
      "Start in a plank position with your hands slightly wider than shoulder-width apart",
      "Lower your body until your chest nearly touches the floor",
      "Push your body back up to the starting position",
      "Keep your core tight throughout the movement"
    ]
  },
  {
    id: "0002", 
    name: "Squats",
    bodyPart: "upper legs",
    target: "quadriceps",
    equipment: "body weight",
    gifUrl: "https://example.com/squat.gif",
    instructions: [
      "Stand with your feet shoulder-width apart",
      "Lower your body as if sitting back into a chair",
      "Keep your knees behind your toes",
      "Return to standing position"
    ]
  }
];

// Helper function to find exercise by name
export const findExerciseByName = (exerciseName, exercises = FALLBACK_EXERCISES) => {
  if (!exerciseName) return null;
  
  const normalizedName = exerciseName.toLowerCase().trim();
  
  // Direct match
  const directMatch = exercises.find(
    exercise => exercise.name.toLowerCase() === normalizedName
  );
  
  if (directMatch) return directMatch;
  
  // Partial match
  const partialMatch = exercises.find(
    exercise => 
      (exercise.name && typeof exercise.name === 'string' && exercise.name.toLowerCase().includes(normalizedName)) ||
      (typeof normalizedName === 'string' && normalizedName.includes(exercise.name?.toLowerCase?.() || ''))
  );
  
  return partialMatch || null;
};

// Helper function to get YouTube search URL
export const getYouTubeSearchUrl = (exerciseName) => {
  if (!exerciseName) return null;
  
  const searchQuery = encodeURIComponent(`how to do ${exerciseName} proper form exercise tutorial`);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
};

// Helper function to format exercise data for the app
export const formatExerciseForApp = (exercise) => {
  return {
    exercise: exercise.name.toLowerCase(),
    title: exercise.name,
    description: `${exercise.name} is a ${exercise.bodyPart} exercise that targets the ${exercise.target}.`,
    muscle_groups: exercise.target,
    difficulty: "beginner", // API doesn't provide difficulty
    equipment: exercise.equipment,
    category: exercise.bodyPart,
    instructions: exercise.instructions || [],
    gifUrl: exercise.gifUrl
  };
}; 