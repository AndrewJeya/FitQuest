// loadingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Animated, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebaseConfig';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, HOUSE_CONFIG, HOUSES } from '../constants';
import { getFitnessResponse } from '../API/chatApi';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Haptics from 'expo-haptics';

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

const LoadingScreen = ({ route, navigation }) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const userId = route.params?.userId;
  const userInfo = route.params?.userInfo;
  const isNewUser = route.params?.isNewUser;

  // Determine user's house and trainer
  const userHouse = userInfo?.house || 'Nova';
  const trainerAvatar = trainerAvatars[userHouse] || trainerAvatars.Nova;
  const backgroundVideo = backgroundVideos[userHouse] || backgroundVideos.Nova;

  const videoPlayer = useVideoPlayer();

  const loadingSteps = [
    {
      text: `Welcome to the House of ${userHouse}!`,
      duration: 2000,
      progress: 20
    },
    {
      text: 'Analyzing your fitness profile...',
      duration: 1500,
      progress: 40
    },
    {
      text: 'Creating personalized training plan...',
      duration: 2000,
      progress: 60
    },
    {
      text: 'Setting up your AI trainer...',
      duration: 1500,
      progress: 80
    },
    {
      text: 'Preparing your dashboard...',
      duration: 1000,
      progress: 100
    }
  ];

  // Start animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle loading sequence
  useEffect(() => {
    const runLoadingSequence = async () => {
      for (let i = 0; i < loadingSteps.length; i++) {
        const step = loadingSteps[i];
        setLoadingStep(i);
        setLoadingText(step.text);
        
        // Animate progress
        Animated.timing(progressAnim, {
          toValue: step.progress / 100,
          duration: step.duration,
          useNativeDriver: false,
        }).start();
        
        setProgress(step.progress);
        
        // Wait for step duration
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }
      
      // Complete loading
      setIsComplete(true);
      setLoadingText('Ready to begin your fitness journey!');
      
      // Generate initial tasks if new user
      if (isNewUser && userId && userInfo) {
        await generateInitialTasks();
      }
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('Dashboard', {
          userInfo: userInfo,
          isProfileComplete: true
        });
      }, 1500);
    };

    runLoadingSequence();
  }, [userId, userInfo, isNewUser]);

  // Generate initial tasks for new users
  const generateInitialTasks = async () => {
    try {
      console.log('LoadingScreen - Generating initial tasks for new user:', userInfo.name);
      
      const personalizedPrompt = `Create a personalized welcome and initial fitness assessment for ${userInfo.name} from the House of ${userHouse}.

User Profile:
- Name: ${userInfo.name}
- House: ${userHouse}
- BMI: ${userInfo.bmi || 'normal'}
- Height: ${userInfo.height || 170}cm
- Weight: ${userInfo.weight || 70}kg
- Exercise Level: ${userInfo.exerciseLevel || 'beginner'}
- Goals: ${(userInfo.selectedOptions && userInfo.selectedOptions.length > 0) ? userInfo.selectedOptions.join(", ") : 'general fitness'}
- Daily Calorie Target: ${userInfo.recommended_calories_per_day || 2000}

Please provide:
1. A warm welcome message acknowledging their house assignment
2. 5-7 daily tasks tailored to their fitness level and goals
3. Initial exercise recommendations
4. Motivational content specific to their house`;

      const aiResponse = await getFitnessResponse({
        name: userInfo.name || 'User',
        house: userHouse,
        bmi: userInfo.bmi || 'normal',
        height: userInfo.height || 170,
        weight: userInfo.weight || 70,
        exerciseLevel: userInfo.exerciseLevel || 'beginner',
        selectedOptions: userInfo.selectedOptions || ['general fitness'],
        message: personalizedPrompt,
        conversationHistory: []
      });

      if (aiResponse?.dailyTasks && aiResponse.dailyTasks.length > 0) {
        // Add date and enhance task data
        const today = new Date().toDateString();
        const tasksWithDate = aiResponse.dailyTasks.map((task, index) => ({
          ...task,
          id: `task_${Date.now()}_${index}`,
          date: today,
          completed: false,
          points: task.points || 5,
          category: task.category || 'general',
          difficulty: task.difficulty || 'medium'
        }));
        
        // Save tasks to Firebase
        await set(ref(db, `users/${userId}/dailyTasks`), tasksWithDate);
        console.log('LoadingScreen - Initial tasks saved:', tasksWithDate.length);
      }

      // Create welcome chat message
      if (aiResponse?.response) {
        const welcomeMessage = {
          id: Date.now().toString(),
          text: aiResponse.response,
          sender: 'trainer',
          timestamp: Date.now(),
          type: 'welcome'
        };
        
        await set(ref(db, `chats/${userId}`), [welcomeMessage]);
        console.log('LoadingScreen - Welcome message saved');
      }
    } catch (error) {
      console.error('LoadingScreen - Error generating initial tasks:', error);
    }
  };

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/loadingBG.png')}
        style={styles.backgroundImage}
      >
        <VideoView
          player={videoPlayer}
          style={styles.backgroundVideo}
          source={backgroundVideo}
          shouldPlay={true}
          isLooping={true}
          resizeMode="cover"
        />
        
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Trainer Avatar */}
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleAnim }] }]}>
              <Image source={trainerAvatar} style={styles.trainerAvatar} />
            </Animated.View>

            {/* Loading Text */}
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>
                {loadingText}
              </Text>
              
              {isComplete && (
                <Animated.Text 
                  style={[
                    styles.completeText,
                    { opacity: fadeAnim }
                  ]}
                >
                  🎉 Let's get started!
                </Animated.Text>
              )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: progressInterpolate }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>

            {/* Loading Indicator */}
            {!isComplete && (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              </View>
            )}

            {/* House Info */}
            <View style={styles.houseInfo}>
              <Text style={styles.houseName}>House of {userHouse}</Text>
              <Text style={styles.houseDescription}>
                Your AI trainer is ready to guide your fitness journey
              </Text>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  avatarContainer: {
    marginBottom: SPACING.XL,
  },
  trainerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.PRIMARY,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  welcomeText: {
    fontSize: FONT_SIZES.LG,
    color: COLORS.WHITE,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.MD,
    lineHeight: 28,
  },
  completeText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.PRIMARY,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.XL,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginBottom: SPACING.XL,
  },
  houseInfo: {
    alignItems: 'center',
  },
  houseName: {
    fontSize: FONT_SIZES.XL,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginBottom: SPACING.SM,
  },
  houseDescription: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoadingScreen;
