// Exercise data extracted from DAREBEE (https://darebee.com/video.html)
// This contains a curated list of exercises with their video links and descriptions

export const DAREBEE_EXERCISES = [
  {
    exercise: "push-ups",
    title: "Push-Ups",
    description: "A classic bodyweight exercise that targets chest, shoulders, and triceps. Great for building upper body strength.",
    muscle_groups: "chest, shoulders, triceps",
    difficulty: "beginner",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/push-ups.html",
    youtube_search: "how to do push ups proper form"
  },
  {
    exercise: "squats",
    title: "Squats",
    description: "A fundamental lower body exercise that targets quadriceps, glutes, and hamstrings. Essential for leg strength.",
    muscle_groups: "quadriceps, glutes, hamstrings",
    difficulty: "beginner",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/squats.html",
    youtube_search: "how to do squats proper form"
  },
  {
    exercise: "jumping jacks",
    title: "Jumping Jacks",
    description: "A full-body cardio exercise that gets your heart rate up and improves coordination.",
    muscle_groups: "full body, cardio",
    difficulty: "beginner",
    equipment: "none",
    category: "cardio",
    video_url: "https://darebee.com/video/jumping-jacks.html",
    youtube_search: "how to do jumping jacks"
  },
  {
    exercise: "burpees",
    title: "Burpees",
    description: "A high-intensity full-body exercise that combines strength and cardio. Great for burning calories.",
    muscle_groups: "full body",
    difficulty: "intermediate",
    equipment: "none",
    category: "cardio",
    video_url: "https://darebee.com/video/burpees.html",
    youtube_search: "how to do burpees proper form"
  },
  {
    exercise: "plank",
    title: "Plank",
    description: "An isometric core exercise that builds stability and strength in your abdominal muscles.",
    muscle_groups: "core, abs, shoulders",
    difficulty: "beginner",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/plank.html",
    youtube_search: "how to do plank exercise"
  },
  {
    exercise: "lunges",
    title: "Lunges",
    description: "A unilateral leg exercise that improves balance and targets each leg individually.",
    muscle_groups: "quadriceps, glutes, hamstrings",
    difficulty: "beginner",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/lunges.html",
    youtube_search: "how to do lunges proper form"
  },
  {
    exercise: "mountain climbers",
    title: "Mountain Climbers",
    description: "A dynamic cardio exercise that targets core and gets your heart rate up.",
    muscle_groups: "core, shoulders, cardio",
    difficulty: "intermediate",
    equipment: "none",
    category: "cardio",
    video_url: "https://darebee.com/video/mountain-climbers.html",
    youtube_search: "how to do mountain climbers exercise"
  },
  {
    exercise: "crunches",
    title: "Crunches",
    description: "A classic abdominal exercise that targets the rectus abdominis muscles.",
    muscle_groups: "abs, core",
    difficulty: "beginner",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/crunches.html",
    youtube_search: "how to do crunches proper form"
  },
  {
    exercise: "bicycle crunches",
    title: "Bicycle Crunches",
    description: "An advanced core exercise that targets obliques and rectus abdominis with a pedaling motion.",
    muscle_groups: "abs, obliques, core",
    difficulty: "intermediate",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/bicycle-crunches.html",
    youtube_search: "how to do bicycle crunches"
  },
  {
    exercise: "star jumps",
    title: "Star Jumps",
    description: "A high-intensity cardio exercise that improves coordination and burns calories.",
    muscle_groups: "full body, cardio",
    difficulty: "beginner",
    equipment: "none",
    category: "cardio",
    video_url: "https://darebee.com/video/star-jumps.html",
    youtube_search: "how to do star jumps exercise"
  },
  {
    exercise: "wall sit",
    title: "Wall Sit",
    description: "An isometric leg exercise that builds endurance in your quadriceps and glutes.",
    muscle_groups: "quadriceps, glutes",
    difficulty: "beginner",
    equipment: "wall",
    category: "strength",
    video_url: "https://darebee.com/video/wall-sit.html",
    youtube_search: "how to do wall sit exercise"
  },
  {
    exercise: "calf raises",
    title: "Calf Raises",
    description: "A simple exercise that strengthens your calf muscles and improves ankle stability.",
    muscle_groups: "calves",
    difficulty: "beginner",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/calf-raises.html",
    youtube_search: "how to do calf raises"
  },
  {
    exercise: "leg raises",
    title: "Leg Raises",
    description: "An effective lower abdominal exercise that targets the lower part of your abs.",
    muscle_groups: "lower abs, core",
    difficulty: "intermediate",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/leg-raises.html",
    youtube_search: "how to do leg raises exercise"
  },
  {
    exercise: "diamond push-ups",
    title: "Diamond Push-Ups",
    description: "An advanced push-up variation that targets triceps more intensely.",
    muscle_groups: "triceps, chest, shoulders",
    difficulty: "advanced",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/diamond-push-ups.html",
    youtube_search: "how to do diamond push ups"
  },
  {
    exercise: "wide push-ups",
    title: "Wide Push-Ups",
    description: "A push-up variation with wider hand placement that targets chest muscles more.",
    muscle_groups: "chest, shoulders, triceps",
    difficulty: "intermediate",
    equipment: "none",
    category: "strength",
    video_url: "https://darebee.com/video/wide-push-ups.html",
    youtube_search: "how to do wide push ups"
  }
];

// Function to find exercise by name (case-insensitive)
export const findExerciseByName = (exerciseName) => {
  if (!exerciseName) return null;
  
  const normalizedName = exerciseName.toLowerCase().trim();
  
  // Direct match
  const directMatch = DAREBEE_EXERCISES.find(
    exercise => exercise.exercise.toLowerCase() === normalizedName
  );
  
  if (directMatch) return directMatch;
  
  // Partial match
  const partialMatch = DAREBEE_EXERCISES.find(
    exercise => 
      exercise.exercise.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(exercise.exercise.toLowerCase()) ||
      exercise.title.toLowerCase().includes(normalizedName)
  );
  
  return partialMatch || null;
};

// Function to get all exercises
export const getAllExercises = () => {
  return DAREBEE_EXERCISES;
};

// Function to get exercises by category
export const getExercisesByCategory = (category) => {
  return DAREBEE_EXERCISES.filter(exercise => exercise.category === category);
};

// Function to get exercises by difficulty
export const getExercisesByDifficulty = (difficulty) => {
  return DAREBEE_EXERCISES.filter(exercise => exercise.difficulty === difficulty);
};

// Function to search exercises
export const searchExercises = (searchTerm) => {
  if (!searchTerm) return DAREBEE_EXERCISES;
  
  const normalizedSearch = searchTerm.toLowerCase();
  
  return DAREBEE_EXERCISES.filter(exercise =>
    exercise.exercise.toLowerCase().includes(normalizedSearch) ||
    exercise.title.toLowerCase().includes(normalizedSearch) ||
    exercise.description.toLowerCase().includes(normalizedSearch) ||
    exercise.muscle_groups.toLowerCase().includes(normalizedSearch)
  );
};

// Function to get YouTube search URL for an exercise
export const getYouTubeSearchUrl = (exerciseName) => {
  const exercise = findExerciseByName(exerciseName);
  if (!exercise) return null;
  
  const searchQuery = encodeURIComponent(exercise.youtube_search);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
};

// Function to get exercise categories
export const getExerciseCategories = () => {
  const categories = [...new Set(DAREBEE_EXERCISES.map(exercise => exercise.category))];
  return categories;
};

// Function to get difficulty levels
export const getDifficultyLevels = () => {
  const difficulties = [...new Set(DAREBEE_EXERCISES.map(exercise => exercise.difficulty))];
  return difficulties;
}; 