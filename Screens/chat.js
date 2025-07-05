import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ImageBackground, Animated, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, set, get, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import { getFitnessResponse } from '../API/chatApi';
import styles from "../styles/chatStyles";
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Haptics from 'expo-haptics';
import { COLORS, HOUSE_CONFIG, HOUSES } from '../constants';

// Helper function to generate unique IDs
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

const backgroundImages = {
  Nova: require('../assets/novaBG.png'),
  Valor: require('../assets/valorBG.png'),
  Lumina: require('../assets/luminaBG.png'),
};

const backgroundVideos = {
  Nova: require('../assets/novaBG.mp4'),
  Valor: require('../assets/valorBG.mp4'),
  Lumina: require('../assets/luminaBG.mp4'),
};

const trainerAvatars = {
  Nova: require('../assets/novaAI.png'),
  Valor: require('../assets/valorAI.png'),
  Lumina: require('../assets/luminaAI.png'),
};

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [mealImage, setMealImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userTasks, setUserTasks] = useState([]);

  const scrollViewRef = useRef();
  const [permission, requestPermission] = useCameraPermissions();
  const videoPlayer = useVideoPlayer();

  // Get route params for better data flow
  const userId = route.params?.userId;
  const routeUserInfo = route.params?.userInfo;
  const routePoints = route.params?.points;
  const routeTasks = route.params?.tasks;
  const mealContext = route.params?.mealContext;

  // Determine user's house and trainer
  const userHouse = routeUserInfo?.house || 'Nova';
  const trainerAvatar = trainerAvatars[userHouse] || trainerAvatars.Nova;
  const backgroundImage = backgroundImages[userHouse] || backgroundImages.Nova;
  const backgroundVideo = backgroundVideos[userHouse] || backgroundVideos.Nova;

  // Initialize chat with user data
  useEffect(() => {
    const initializeChat = async () => {
      if (!userId) {
        console.error('No userId provided to chat');
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        
        // Set user data from route params
        if (routePoints !== undefined) setUserPoints(routePoints);
        if (routeTasks) setUserTasks(routeTasks);

        // Load chat history from Firebase
        const chatRef = ref(db, `chats/${userId}`);
        const snapshot = await get(chatRef);
        
        if (snapshot.exists()) {
          const chatHistory = snapshot.val();
          // Ensure the first message is the Gemini greeting
          if (chatHistory.length > 0 && chatHistory[0].type === 'welcome') {
            setMessages(chatHistory);
          } else {
            // Generate Gemini greeting and prepend it
            const welcomeMessage = await generateWelcomeMessage();
            const initialMessages = [welcomeMessage, ...chatHistory];
            setMessages(initialMessages);
            await set(chatRef, initialMessages);
          }
          console.log('Chat history loaded:', chatHistory.length, 'messages');
        } else {
          // Generate welcome message for new users
          const welcomeMessage = await generateWelcomeMessage();
          const initialMessages = [welcomeMessage];
          setMessages(initialMessages);
          // Save to Firebase
          await set(ref(db, `chats/${userId}`), initialMessages);
          console.log('Welcome message generated and saved');
        }

        // Set up real-time listener for chat updates
        const unsubscribe = onValue(chatRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedMessages = snapshot.val();
            setMessages(updatedMessages);
          }
        });

        // Handle meal context if provided
        if (mealContext) {
          setTimeout(() => {
            handleMealContext(mealContext);
          }, 1000);
        }

        setIsInitializing(false);
        return unsubscribe;
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [userId, routeUserInfo, routePoints, routeTasks, mealContext]);

  // Generate personalized welcome message
  const generateWelcomeMessage = async () => {
    try {
      const welcomePrompt = `Welcome ${routeUserInfo?.name || 'User'} to the House of ${userHouse}! I'm your AI fitness trainer. 

User Profile:
- Name: ${routeUserInfo?.name || 'User'}
- House: ${userHouse}
- BMI: ${routeUserInfo?.bmi || 'normal'}
- Exercise Level: ${routeUserInfo?.exerciseLevel || 'beginner'}
- Goals: ${(routeUserInfo?.selectedOptions && routeUserInfo.selectedOptions.length > 0) ? routeUserInfo.selectedOptions.join(", ") : 'general fitness'}

Please provide a warm, personalized welcome message that:
1. Acknowledges their house affiliation
2. Mentions their fitness goals
3. Offers to help with their fitness journey
4. Suggests they can ask for exercises, meal advice, or daily tasks
5. Keeps it concise and motivating`;

      const response = await getFitnessResponse({
        name: routeUserInfo?.name || 'User',
        house: userHouse,
        bmi: routeUserInfo?.bmi || 'normal',
        height: routeUserInfo?.height || 170,
        weight: routeUserInfo?.weight || 70,
        exerciseLevel: routeUserInfo?.exerciseLevel || 'beginner',
        selectedOptions: routeUserInfo?.selectedOptions || ['general fitness'],
        message: welcomePrompt,
        conversationHistory: []
      });

      return {
        id: generateId(),
        text: response.response || `Welcome to the House of ${userHouse}, ${routeUserInfo?.name || 'User'}! I'm your AI fitness trainer. How can I help you today?`,
        sender: 'trainer',
        timestamp: Date.now(),
        type: 'welcome'
      };
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return {
        id: generateId(),
        text: `Welcome to the House of ${userHouse}, ${routeUserInfo?.name || 'User'}! I'm your AI fitness trainer. How can I help you today?`,
        sender: 'trainer',
        timestamp: Date.now(),
        type: 'welcome'
      };
    }
  };

  // Handle meal context from dashboard
  const handleMealContext = (context) => {
    const mealMessage = {
      id: generateId(),
      text: `I see you're working on "${context}". Would you like to take a photo of your meal for verification?`,
      sender: 'trainer',
      timestamp: Date.now(),
      type: 'meal_prompt'
    };
    
    setMessages(prev => [...prev, mealMessage]);
    setInputText('Take a photo of my meal');
  };

  // Send message with enhanced AI integration
  const sendMessage = async (text = inputText, image = null) => {
    if (!text.trim() && !image) return;

    const userMessage = {
      id: generateId(),
      text: text.trim(),
      sender: 'user',
      timestamp: Date.now(),
      ...(image && { image })
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setMealImage(null);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Enhanced AI request with user context
      const aiResponse = await getFitnessResponse({
        name: routeUserInfo?.name || 'User',
        house: userHouse,
        bmi: routeUserInfo?.bmi || 'normal',
        height: routeUserInfo?.height || 170,
        weight: routeUserInfo?.weight || 70,
        exerciseLevel: routeUserInfo?.exerciseLevel || 'beginner',
        selectedOptions: routeUserInfo?.selectedOptions || ['general fitness'],
        message: text.trim(),
        conversationHistory,
        mealImage: image,
        currentPoints: userPoints,
        currentTasks: userTasks
      });

      // Create trainer response
      const trainerMessage = {
        id: generateId(),
        text: aiResponse.response,
        sender: 'trainer',
        timestamp: Date.now(),
        ...(aiResponse.youtubeLink && { youtubeLink: aiResponse.youtubeLink }),
        ...(aiResponse.exerciseDetails && { exerciseDetails: aiResponse.exerciseDetails }),
        ...(aiResponse.dailyTasks && { dailyTasks: aiResponse.dailyTasks }),
        ...(aiResponse.counters && { counters: aiResponse.counters })
      };

      // Update messages
      const updatedMessages = [...messages, userMessage, trainerMessage];
      setMessages(updatedMessages);

      // Save to Firebase
      await set(ref(db, `chats/${userId}`), updatedMessages);

      // Update points if provided
      if (aiResponse.counters?.points) {
        setUserPoints(prev => prev + aiResponse.counters.points);
      }

      // Handle exercise details
      if (aiResponse.exerciseDetails) {
        setCurrentExercise(aiResponse.exerciseDetails);
        setShowExerciseDetails(true);
      }

      // Handle daily tasks
      if (aiResponse.dailyTasks && aiResponse.dailyTasks.length > 0) {
        // Update tasks in Firebase and local state
        await set(ref(db, `users/${userId}/dailyTasks`), aiResponse.dailyTasks);
        setUserTasks(aiResponse.dailyTasks);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: generateId(),
        text: "I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'trainer',
        timestamp: Date.now()
      };

      const updatedMessages = [...messages, userMessage, fallbackMessage];
      setMessages(updatedMessages);
      await set(ref(db, `chats/${userId}`), updatedMessages);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert('Camera permission required', 'Please allow camera access to take photos.');
        return;
      }
    }

    setShowCamera(true);
  };

  // Handle photo capture
  const handlePhotoCapture = async (photo) => {
    setShowCamera(false);
    setMealImage(photo.uri);
    
    // Auto-send the photo
    await sendMessage('Here is my meal photo', photo.uri);
  };

  // Handle exercise completion
  const handleExerciseComplete = () => {
    setShowExerciseDetails(false);
    setCurrentExercise(null);
    setExerciseCount(0);
    
    const completionMessage = {
      id: generateId(),
      text: "Great job completing the exercise! Keep up the excellent work! 💪",
      sender: 'trainer',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, completionMessage]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Show loading screen
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ImageBackground
          source={backgroundImage}
          style={styles.loadingBackground}
        >
          <VideoView
            player={videoPlayer}
            style={styles.loadingVideo}
            source={backgroundVideo}
            shouldPlay={true}
            isLooping={true}
            resizeMode="cover"
          />
          <View style={styles.loadingContent}>
            <Image source={trainerAvatar} style={styles.loadingAvatar} />
            <Text style={styles.loadingText}>Connecting to your AI trainer...</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: '100%'
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ImageBackground source={backgroundImage} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Image source={trainerAvatar} style={styles.trainerAvatar} />
            <View style={styles.trainerInfo}>
              <Text style={styles.trainerName}>AI Trainer</Text>
              <Text style={styles.trainerTitle}>House of {userHouse}</Text>
            </View>
          </View>
          <View style={styles.pointsDisplay}>
            <Text style={styles.pointsText}>{userPoints}</Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Image source={trainerAvatar} style={styles.emptyAvatar} />
              <Text style={styles.emptyTitle}>Start Your Fitness Journey</Text>
              <Text style={styles.emptySubtitle}>
                Chat with your AI trainer to get personalized workouts, meal advice, and daily tasks!
              </Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <View
                key={message.id || index}
                style={[
                  styles.messageContainer,
                  message.sender === 'user' ? styles.userMessage : styles.trainerMessage
                ]}
              >
                {message.sender === 'trainer' && (
                  <Image source={trainerAvatar} style={styles.messageAvatar} />
                )}
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>{message.text}</Text>
                  
                  {/* Exercise details */}
                  {message.exerciseDetails && (
                    <View style={styles.exerciseCard}>
                      <Text style={styles.exerciseTitle}>
                        {message.exerciseDetails.exercise || message.exerciseDetails.name}
                      </Text>
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.exerciseDetail}>
                          Sets: {message.exerciseDetails.sets}
                        </Text>
                        <Text style={styles.exerciseDetail}>
                          Reps: {message.exerciseDetails.reps}
                        </Text>
                      </View>
                      {message.youtubeLink && (
                        <TouchableOpacity style={styles.tutorialButton}>
                          <Text style={styles.tutorialButtonText}>Watch Tutorial</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Points earned */}
                  {message.counters?.points && message.counters.points > 0 && (
                    <View style={styles.pointsEarned}>
                      <Text style={styles.pointsEarnedText}>
                        +{message.counters.points} points earned! 🎉
                      </Text>
                    </View>
                  )}

                  {/* Image */}
                  {message.image && (
                    <Image source={{ uri: message.image }} style={styles.messageImage} />
                  )}
                </View>
              </View>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <View style={styles.messageContainer}>
              <Image source={trainerAvatar} style={styles.messageAvatar} />
              <View style={styles.messageBubble}>
                <Text style={styles.typingText}>AI trainer is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Exercise details modal */}
        {showExerciseDetails && currentExercise && (
          <View style={styles.exerciseModal}>
            <View style={styles.exerciseModalContent}>
              <Text style={styles.exerciseModalTitle}>
                {currentExercise.exercise || currentExercise.name}
              </Text>
              <Text style={styles.exerciseModalSubtitle}>
                Complete your sets and reps
              </Text>
              <View style={styles.exerciseCounter}>
                <Text style={styles.exerciseCounterText}>
                  Set {Math.floor(exerciseCount / (currentExercise.reps || 10)) + 1} of {currentExercise.sets}
                </Text>
                <Text style={styles.exerciseCounterSubtext}>
                  {exerciseCount} reps completed
                </Text>
              </View>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => setExerciseCount(prev => prev + 1)}
              >
                <Text style={styles.completeButtonText}>Complete Rep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleExerciseComplete}
              >
                <Text style={styles.finishButtonText}>Finish Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Camera view */}
        {showCamera && (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onPictureTaken={handlePhotoCapture}
            />
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cameraButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => {
                  // Trigger photo capture
                  if (videoPlayer) {
                    videoPlayer.takePictureAsync();
                  }
                }}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input area */}
        {!showCamera && (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleCameraCapture}
            >
              <Text style={styles.cameraButtonText}>📷</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#888"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() && !mealImage) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() && !mealImage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;