import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { set, ref } from 'firebase/database';
import { db } from '../firebaseConfig';
import { getFitnessResponse } from '../API/chatApi';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getHouseConfig } from '../utils/helpers';

const PostHouseLoadingScreen = ({ route, navigation }) => {
  const { userId, userInfo } = route.params;
  const [loadingText, setLoadingText] = useState('Personalizing your dashboard...');
  const progress = useRef(new Animated.Value(0)).current;
  const houseConfig = getHouseConfig(userInfo.house);
  const player = useVideoPlayer(houseConfig.background, player => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    const generateAndSaveTasks = async () => {
      setLoadingText('Generating your daily plan...');
      try {
        const aiResponse = await getFitnessResponse({
          ...userInfo,
          name: userInfo.name,
          house: userInfo.house,
          bmi: userInfo.bmi,
          height: userInfo.height,
          weight: userInfo.weight,
          exerciseLevel: userInfo.exerciseLevel,
          selectedOptions: userInfo.selectedOptions,
        });
        // Save the AI response as the first chat message for the user
        const welcomeMessage = {
          id: Date.now().toString(),
          text: aiResponse?.response || `Hi ${userInfo.name}! Let's get started with your fitness journey!`,
          sender: 'trainer',
          dailyTasks: aiResponse.dailyTasks || [],
          exerciseDetails: aiResponse.exerciseDetails || {},
          youtubeLink: aiResponse.youtubeLink || '',
        };
        await set(ref(db, `chats/${userId}`), [welcomeMessage]);
        // Optionally, save points/tasks to user profile
        await set(ref(db, `users/${userId}/points`), aiResponse.counters?.points || 0);
        // Update userInfo with AI-generated justification
        const updatedUserInfo = {
          ...userInfo,
          justification: aiResponse.justification || userInfo.justification,
        };
        setTimeout(() => {
          navigation.replace('MainTabs', {
            screen: 'Home',
            params: {
              userInfo: updatedUserInfo,
              recommended_calories_per_day: userInfo.recommended_calories_per_day,
            },
          });
        }, 1200);
      } catch (error) {
        setLoadingText('Something went wrong. Please try again.');
        setTimeout(() => navigation.replace('MainTabs', { screen: 'Home', params: { userInfo } }), 2000);
      }
    };
    generateAndSaveTasks();
  }, [userId, userInfo, navigation]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
          Hi {userInfo.name}, welcome to {houseConfig.name}!
        </Text>
        <Text style={styles.Loading_subtitle}>{loadingText}</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressInterpolate }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  LoadingPagecontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001F3F',
  },
  Loading_backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  Loading_container: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  Loading_welcomeText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  Loading_subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.85,
  },
  progressBarContainer: {
    width: 220,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#03C988',
    borderRadius: 8,
  },
});

export default PostHouseLoadingScreen; 