import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, Animated, Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebaseConfig';
import { useVideoPlayer, VideoView } from 'expo-video';
import { generateId, getHouseConfig } from '../utils/helpers';
import { Message, ChatInput } from '../components/chat';
import { useChat, useCamera } from '../hooks';
import notificationService from '../utils/notificationService';
import styles from "../styles/chatStyles";

const Chat = ({ route, navigation }) => {
  const userInfo = route.params?.userInfo || {};
  const { name = "User", house = "unknown" } = userInfo;
  
  const userId = route.params?.userId;
  const houseConfig = getHouseConfig(house);
  const trainerAvatar = houseConfig.avatar;

  // Custom hooks
  const {
    messages,
    points,
    tasks,
    isLoading,
    initialized,
    scrollViewRef,
    sendMessage,
    addImageMessage,
  } = useChat(userId, userInfo);

  const {
    cameraVisible,
    cameraRef,
    openCamera,
    closeCamera,
    takePicture,
  } = useCamera();

  // Animation for loading screen
  const progress = useRef(new Animated.Value(0)).current;
  const player = useVideoPlayer(houseConfig.background, player => {
    player.loop = true;
    player.play();
  });

  // Track completed exercises
  const [completedExercises, setCompletedExercises] = useState(new Set());

  // Handle exercise completion
  const handleCompleted = useCallback(async (messageId) => {
    if (completedExercises.has(messageId)) {
      Alert.alert("Already Completed", "This exercise has already been marked as completed!");
      return;
    }

    // Mark exercise as completed
    setCompletedExercises(prev => new Set([...prev, messageId]));

    // Add points
    const pointsEarned = 5;
    
    // Create completion message
    const completionMessage = {
      id: generateId(),
      text: "🎉 Excellent work! Exercise completed successfully. Keep up the great energy!",
      sender: "trainer",
      points: pointsEarned,
      isCompletion: true
    };

    // Get current messages from Firebase and add completion message
    try {
      const chatRef = ref(db, `chats/${userId}`);
      const snapshot = await get(chatRef);
      const currentMessages = snapshot.exists() ? snapshot.val() : [];
      const updatedMessages = [...currentMessages, completionMessage];
      await set(chatRef, updatedMessages);
    } catch (error) {
      console.error('Error adding completion message:', error);
      return;
    }

    // Continue the conversation with next exercise or encouragement
    setTimeout(async () => {
      const followUpMessage = {
        id: generateId(),
        text: "Ready for the next challenge? Let me know how you're feeling or if you'd like another exercise!",
        sender: "trainer"
      };
      
      try {
        const chatRef = ref(db, `chats/${userId}`);
        const snapshot = await get(chatRef);
        const currentMessages = snapshot.exists() ? snapshot.val() : [];
        const finalMessages = [...currentMessages, followUpMessage];
        await set(chatRef, finalMessages);
      } catch (error) {
        console.error('Error adding follow-up message:', error);
      }
    }, 2000);
  }, [userId, completedExercises]);

  // Handle tutorial request
  const handleTutorial = useCallback((messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message?.youtubeLink) {
      Alert.alert("No Tutorial", "Sorry, no tutorial available for this exercise.");
      return;
    }
    
    // Tutorial is already embedded in the message component
    // This function can be used for additional tutorial features
  }, [messages]);

  // Handle camera photo capture
  const handlePhotoCapture = useCallback(async () => {
    const imageUri = await takePicture();
    if (imageUri) {
      await addImageMessage(imageUri);
      closeCamera();
    }
  }, [takePicture, addImageMessage, closeCamera]);

  // Loading animation
  useEffect(() => {
    if (initialized) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    }
  }, [initialized, progress]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Initialize notifications when component mounts
  useEffect(() => {
    const initNotifications = async () => {
      if (userId) {
        await notificationService.initialize();
        console.log('Notifications initialized for user:', userId);
      }
    };
    
    initNotifications();
    
    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, [userId]);

  // Schedule notifications when new tasks are assigned
  useEffect(() => {
    const scheduleTaskNotifications = async () => {
      if (tasks && tasks.length > 0 && userId) {
        console.log('Scheduling notifications for', tasks.length, 'tasks');
        await notificationService.scheduleDailyTasks(tasks, userId);
        
        // Also schedule daily checkin at 9 AM
        await notificationService.scheduleDailyCheckin(userId, 9, 0);
        
        // Schedule meal reminders
        await notificationService.scheduleMealReminder('Breakfast', userId, 8, 0);
        await notificationService.scheduleMealReminder('Lunch', userId, 12, 0);
        await notificationService.scheduleMealReminder('Dinner', userId, 18, 0);
        
        // Schedule water reminder every 2 hours
        await notificationService.scheduleWaterReminder(userId, 2);
      }
    };
    
    scheduleTaskNotifications();
  }, [tasks, userId]);

  // Schedule exercise reminder when new exercise is assigned
  useEffect(() => {
    const scheduleExerciseReminder = async () => {
      if (messages.length > 0 && userId) {
        const lastMessage = messages[messages.length - 1];
        
        // Check if the last message contains exercise details
        if (lastMessage?.exerciseDetails?.exercise && 
            lastMessage.sender === 'trainer' && 
            !lastMessage.isCompletion) {
          
          console.log('Scheduling exercise reminder for:', lastMessage.exerciseDetails.exercise);
          await notificationService.scheduleExerciseReminder(
            lastMessage.exerciseDetails, 
            userId, 
            30 // 30 minutes delay
          );
        }
      }
    };
    
    scheduleExerciseReminder();
  }, [messages, userId]);

  // Loading screen
  if (!initialized) {
    return (
      <View style={styles.LoadingPagecontainer}>
        <VideoView 
          style={styles.Loading_backgroundVideo} 
          player={player}
          resizeMode="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        <View style={styles.Loading_container}>
          <Text style={styles.Loading_welcomeText}>
            Hi {name}, welcome to {houseConfig.name}!
          </Text>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressInterpolate }]} />
          </View>
        </View>
      </View>
    );
  }

  // Camera screen
  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.cameraPreview} ref={cameraRef}>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity onPress={handlePhotoCapture} style={styles.captureButton}>
              <Text style={styles.captureButtonText}>SNAP</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/gradientBG.png')} style={styles.backgroundImage}>
      {/* Top Navigation */}
      <View style={styles.topNavContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('MainTabs', {
            screen: 'Home',
            params: { userInfo, points, tasks }
          })}
        >
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.pointsContainer}>
          <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
          <Text style={styles.pointsText}>{points}</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              trainerAvatar={trainerAvatar}
              onTutorial={() => handleTutorial(message.id)}
              onCompleted={() => handleCompleted(message.id)}
              isCompleted={completedExercises.has(message.id)}
            />
          ))}
        </ScrollView>

        {/* Chat Input */}
        <ChatInput
          onSend={sendMessage}
          onCameraPress={openCamera}
          isLoading={isLoading}
          placeholder="Type your questions..."
        />
      </View>
    </ImageBackground>
  );
};

export default React.memo(Chat);
