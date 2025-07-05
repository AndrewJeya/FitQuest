import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, get, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import { getFitnessResponse } from '../API/chatApi';
import { generateId } from '../utils/helpers';
import notificationService from '../utils/notificationService';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const useChat = (userId, userInfo, userDataManager = null) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollViewRef = useRef(null);

  // Use centralized data management if provided, otherwise fall back to local state
  const {
    points = 0,
    tasks = [],
    addPoints = null,
    updateTasks = null,
    updateTaskCompletion = null,
    updateDailyProgress = null,
  } = userDataManager || {};

  // Local state fallback if no centralized management
  const [localPoints, setLocalPoints] = useState(0);
  const [localTasks, setLocalTasks] = useState([]);
  
  const currentPoints = addPoints ? points : localPoints;
  const currentTasks = updateTasks ? tasks : localTasks;

  // Load chat history from Firebase
  const loadChatHistory = useCallback(async () => {
    try {
      const snapshot = await get(ref(db, `chats/${userId}`));
      if (snapshot.exists()) {
        setMessages(snapshot.val());
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      throw new Error("Could not load chat history");
    }
  }, [userId]);

  // Real-time listener for chat updates
  useEffect(() => {
    if (!userId) return;

    console.log('useChat - Setting up real-time listener for userId:', userId);
    const dbRef = ref(db, `chats/${userId}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        console.log('useChat - Received chat data from Firebase:', chatData?.length || 0, 'messages');
        setMessages(chatData);
      } else {
        console.log("useChat - No chat data found for user:", userId);
        setMessages([]);
      }
    }, (error) => {
      console.error("useChat - Firebase read failed:", error);
    });

    return () => {
      console.log('useChat - Cleaning up real-time listener for userId:', userId);
      unsubscribe();
    };
  }, [userId]);

  // Initialize chat with welcome message if empty
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check if we have basic user info, but don't require all fields
        if (!userInfo?.name) {
          console.log("No user name found, using default welcome");
          const defaultWelcome = {
            id: generateId(),
            text: "Welcome to FitQuest! I'm here to help you on your fitness journey. What would you like to work on today?",
            sender: 'trainer'
          };
          await set(ref(db, `chats/${userId}`), [defaultWelcome]);
          setInitialized(true);
          return;
        }

        await loadChatHistory();

        // Check if messages are empty after loading
        const snapshot = await get(ref(db, `chats/${userId}`));
        if (!snapshot.exists() || snapshot.val().length === 0) {
          // Build a system prompt for Gemini to generate a unique welcome message
          const goals = userInfo.selectedOptions && userInfo.selectedOptions.length > 0
            ? userInfo.selectedOptions.join(", ")
            : (userInfo.goals || "your fitness goals");
          const methods = userInfo.selectedOptions && userInfo.selectedOptions.length > 0
            ? userInfo.selectedOptions.join(", ")
            : "your preferred methods";
          const systemPrompt = `You are an expert AI fitness trainer named ${userInfo.house ? (userInfo.house === 'Nova' ? 'Lyra' : userInfo.house === 'Lumina' ? 'Serene' : 'Maximus') : 'your trainer'} from the House of ${userInfo.house || 'FitQuest'}.\n\nThe user is:\n- Name: ${userInfo.name}\n- House: ${userInfo.house || 'FitQuest'}\n- Main goals: ${goals}\n- Preferred methods: ${methods}\n\nYour task: Greet the user with a unique, motivating welcome message in your own style. Briefly explain how you will help them achieve their goals using their preferred methods. Make it personal, inspiring, and house-specific. Do NOT include any JSON or formatting, just the message text.`;

          const response = await getFitnessResponse({
            name: userInfo.name,
            house: userInfo.house || 'FitQuest',
            bmi: userInfo.bmi || 'normal',
            height: userInfo.height || 170,
            weight: userInfo.weight || 70,
            exerciseLevel: userInfo.exerciseLevel || 'beginner',
            selectedOptions: userInfo.selectedOptions || ['general fitness'],
            message: systemPrompt,
          });

          const welcomeMessage = {
            id: generateId(),
            text: response?.response || "Welcome to FitQuest! I'm here to help you on your fitness journey. What would you like to work on today?",
            sender: 'trainer'
          };

          await set(ref(db, `chats/${userId}`), [welcomeMessage]);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        // Create a fallback welcome message
        try {
          const fallbackWelcome = {
            id: generateId(),
            text: "Welcome to FitQuest! I'm here to help you on your fitness journey. What would you like to work on today?",
            sender: 'trainer'
          };
          await set(ref(db, `chats/${userId}`), [fallbackWelcome]);
        } catch (fallbackError) {
          console.error('Fallback welcome message failed:', fallbackError);
        }
        setInitialized(true);
      }
    };

    if (userId) {
      initializeChat();
    }
  }, [userId, userInfo, loadChatHistory]);

  // Send message function
  const sendMessage = useCallback(async (input) => {
    if (!input.trim() || !userId) return;

    setIsLoading(true);
    const newUserMessage = { id: generateId(), text: input, sender: 'user' };
    const updatedMessages = [...messages, newUserMessage];
    
    try {
      await set(ref(db, `chats/${userId}`), updatedMessages);

      // Create conversation context for the AI
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Check if this is the first message and user has no tasks
      const isFirstMessage = messages.length === 0;
      const hasNoTasks = !currentTasks || currentTasks.length === 0;
      
      // If it's the first message and no tasks, generate daily tasks first
      if (isFirstMessage && hasNoTasks) {
        console.log('Chat - First message detected, generating daily tasks');
        const taskGenerationResponse = await getFitnessResponse({
          name: userInfo?.name || 'User',
          house: userInfo?.house || 'FitQuest',
          bmi: userInfo?.bmi || 'normal',
          height: userInfo?.height || 170,
          weight: userInfo?.weight || 70,
          exerciseLevel: userInfo?.exerciseLevel || 'beginner',
          selectedOptions: userInfo?.selectedOptions || ['general fitness'],
          message: "Generate my daily fitness tasks for today",
          conversationHistory: []
        });

        if (taskGenerationResponse?.dailyTasks && taskGenerationResponse.dailyTasks.length > 0) {
          // Add date to each task
          const today = new Date().toDateString();
          const tasksWithDate = taskGenerationResponse.dailyTasks.map(task => ({
            ...task,
            date: today,
            completed: false
          }));
          
          // Save tasks to Firebase
          await set(ref(db, `users/${userId}/dailyTasks`), tasksWithDate);
          setLocalTasks(tasksWithDate);
          
          // Schedule notifications for the new tasks
          await notificationService.scheduleDailyTasks(tasksWithDate, userId);
          
          console.log('Chat - Daily tasks generated and saved');
        }
      }

      const response = await getFitnessResponse({ 
        name: userInfo?.name || 'User',
        house: userInfo?.house || 'FitQuest',
        bmi: userInfo?.bmi || 'normal',
        height: userInfo?.height || 170,
        weight: userInfo?.weight || 70,
        exerciseLevel: userInfo?.exerciseLevel || 'beginner',
        selectedOptions: userInfo?.selectedOptions || ['general fitness'],
        message: input,
        conversationHistory: conversationHistory // Pass conversation history
      });
      
      if (response?.response) {
        const pointsEarned = response.counters?.points || 0;
        
        // Update points in Firebase for persistence
        try {
          await set(ref(db, `users/${userId}/points`), currentPoints + pointsEarned);
        } catch (error) {
          console.error("Error updating points:", error);
        }
        
        setLocalPoints(prev => prev + pointsEarned);
        
        // Update tasks with new daily tasks from AI response (only if provided)
        if (response.dailyTasks && response.dailyTasks.length > 0) {
          setLocalTasks(response.dailyTasks);
          // Also save tasks to Firebase for persistence
          try {
            await set(ref(db, `users/${userId}/dailyTasks`), response.dailyTasks);
          } catch (error) {
            console.error("Error saving daily tasks:", error);
          }
        }

        const botResponse = {
          id: generateId(),
          text: response.response,
          sender: 'trainer',
          points: pointsEarned,
          exerciseDetails: response.exerciseDetails || {},
          youtubeLink: response.youtubeLink || "",
        };

        const finalMessages = [...updatedMessages, botResponse];
        await set(ref(db, `chats/${userId}`), finalMessages);
      } else {
        // Handle case where response is missing
        const fallbackResponse = {
          id: generateId(),
          text: "I'm here to help with your fitness journey! What would you like to work on today?",
          sender: 'trainer',
          points: 0,
          exerciseDetails: {},
          youtubeLink: "",
        };

        const finalMessages = [...updatedMessages, fallbackResponse];
        await set(ref(db, `chats/${userId}`), finalMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      let errorMessage = "I'm having trouble connecting right now. Let me give you a quick workout instead!";
      
      if (typeof error.message === 'string' && (error.message.includes("network") || error.message.includes("fetch"))) {
        errorMessage = "Network connection issue. Here's a quick exercise to keep you moving!";
      } else if (typeof error.message === 'string' && (error.message.includes("API") || error.message.includes("OpenAI"))) {
        errorMessage = "Let me provide you with a great workout while I get my systems back online!";
      }
      
      // Create a helpful fallback response with exercise
      const fallbackExercises = [
        {
          exercise: "Push-ups",
          sets: 3,
          reps: 10,
          message: "Let's do some push-ups! 3 sets of 10 reps. Perfect for building strength!"
        },
        {
          exercise: "Squats", 
          sets: 3,
          reps: 15,
          message: "Time for squats! 3 sets of 15 reps. Great for your legs and core!"
        },
        {
          exercise: "Jumping Jacks",
          sets: 3,
          reps: 20,
          message: "Let's get your heart rate up with jumping jacks! 3 sets of 20 reps!"
        }
      ];
      
      const randomExercise = fallbackExercises[Math.floor(Math.random() * fallbackExercises.length)];
      
      const errorResponse = {
        id: generateId(),
        text: `${errorMessage} ${randomExercise.message}`,
        sender: 'trainer',
        isError: false, // Don't show as error to user
        exerciseDetails: {
          exercise: randomExercise.exercise,
          sets: randomExercise.sets,
          reps: randomExercise.reps
        },
        youtubeLink: "https://www.youtube.com/results?search_query=" + encodeURIComponent(randomExercise.exercise + " tutorial"),
        points: 5
      };

      const finalMessages = [...updatedMessages, errorResponse];
      await set(ref(db, `chats/${userId}`), finalMessages);
      
      // Add points for the fallback exercise
      setLocalPoints(prev => prev + 5);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userId, userInfo, currentPoints, currentTasks]);

  // Load user points and tasks from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      try {
        // Load points
        const pointsSnapshot = await get(ref(db, `users/${userId}/points`));
        if (pointsSnapshot.exists()) {
          setLocalPoints(pointsSnapshot.val());
        }
        
        // Load daily tasks
        const tasksSnapshot = await get(ref(db, `users/${userId}/dailyTasks`));
        if (tasksSnapshot.exists()) {
          setLocalTasks(tasksSnapshot.val());
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [userId]);

  // Add image message
  const addImageMessage = useCallback(async (imageUri) => {
    if (!userId) return;

    const newImageMessage = { 
      id: generateId(), 
      imageUri, 
      sender: 'user', 
      type: 'image' 
    };
    const updatedMessages = [...messages, newImageMessage];
    
    try {
      await set(ref(db, `chats/${userId}`), updatedMessages);
    } catch (error) {
      console.error('Error adding image message:', error);
      throw new Error("Could not add image message");
    }
  }, [messages, userId]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, scrollToBottom]);

  // Update task completion status
  const updateLocalTaskCompletion = useCallback(async (taskTitle, completed) => {
    if (!userId) return;
    
    const updatedTasks = currentTasks.map(task => {
      if (task.title === taskTitle) {
        return { ...task, completed };
      }
      return task;
    });
    
    setLocalTasks(updatedTasks);
    
    // Save updated tasks to Firebase
    try {
      await set(ref(db, `users/${userId}/dailyTasks`), updatedTasks);
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  }, [currentTasks, userId]);

  const handleTaskComplete = useCallback(async (taskTitle) => {
    try {
      // Update task completion in the centralized system
      if (updateTaskCompletion) {
        await updateTaskCompletion(taskTitle, true);
      } else {
        // Fallback to local update if centralized system not available
        await updateLocalTaskCompletion(taskTitle, true);
      }
      
      // Update daily progress
      if (updateDailyProgress) {
        await updateDailyProgress();
      }
      
      // Add points for task completion
      const pointsToAdd = 5; // Base points for task completion
      if (addPoints) {
        await addPoints(pointsToAdd);
      }
      
      // Send completion message to AI
      const completionMessage = `I just completed the task: "${taskTitle}". Please give me some encouragement and maybe suggest what to do next!`;
      await sendMessage(completionMessage);
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }, [updateTaskCompletion, updateLocalTaskCompletion, updateDailyProgress, addPoints, sendMessage]);

  return {
    messages,
    currentPoints,
    currentTasks,
    isLoading,
    initialized,
    scrollViewRef,
    sendMessage,
    addImageMessage,
    updateTaskCompletion: updateLocalTaskCompletion,
    handleTaskComplete,
  };
}; 