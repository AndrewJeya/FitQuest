import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, get, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import { getFitnessResponse } from '../API/chatApi';
import { generateId } from '../utils/helpers';

export const useChat = (userId, userInfo) => {
  const [messages, setMessages] = useState([]);
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollViewRef = useRef(null);

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

    const dbRef = ref(db, `chats/${userId}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.val());
      } else {
        console.log("No chat data found for user:", userId);
      }
    }, (error) => {
      console.error("Firebase read failed:", error);
    });

    return () => unsubscribe();
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
          const prompt = `Hello ${userInfo.name}${userInfo.house ? `, welcome to the House of ${userInfo.house}` : ''}! Let's get started with your fitness journey!`;

          const response = await getFitnessResponse({
            name: userInfo.name,
            house: userInfo.house || 'FitQuest',
            bmi: userInfo.bmi || 'normal',
            height: userInfo.height || 170,
            weight: userInfo.weight || 70,
            exerciseLevel: userInfo.exerciseLevel || 'beginner',
            selectedOptions: userInfo.selectedOptions || ['general fitness'],
            message: prompt,
          });

          const welcomeMessage = {
            id: generateId(),
            text: response?.response || `Hi ${userInfo.name}! Let's get started with your fitness journey!`,
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
          await set(ref(db, `users/${userId}/points`), points + pointsEarned);
        } catch (error) {
          console.error("Error updating points:", error);
        }
        
        setPoints(prev => prev + pointsEarned);
        setTasks(response.dailyTasks || []);

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
      
      if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network connection issue. Here's a quick exercise to keep you moving!";
      } else if (error.message.includes("API") || error.message.includes("Gemini")) {
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
      setPoints(prev => prev + 5);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userId, userInfo, points]);

  // Load user points from Firebase
  useEffect(() => {
    const loadUserPoints = async () => {
      if (!userId) return;
      
      try {
        const snapshot = await get(ref(db, `users/${userId}/points`));
        if (snapshot.exists()) {
          setPoints(snapshot.val());
        }
      } catch (error) {
        console.error("Error loading user points:", error);
      }
    };

    loadUserPoints();
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

  return {
    messages,
    points,
    tasks,
    isLoading,
    initialized,
    scrollViewRef,
    sendMessage,
    addImageMessage,
    scrollToBottom,
  };
}; 