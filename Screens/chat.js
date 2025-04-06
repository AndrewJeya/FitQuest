import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ImageBackground, Animated, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, set, get, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import { getFitnessResponse } from '../API/chatApi';
import styles from "../styles/chatStyles";
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';

// Helper function to generate unique IDs
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

const encodeEmail = (email) => {
  return email.replace(/\./g, ',').replace(/@/g, '_at_').replace(/\$/g, '_dollar_').replace(/#/g, '_hash_');
};


const backgroundImages = {
  Nova: require('../assets/valorBG.mp4'),
  Valor: require('../assets/valorBG.mp4'),
  Lumina: require('../assets/valorBG.mp4'),
};

const trainerAvatars = {
  Nova: require('../assets/novaPP.png'),
  Lumina: require('../assets/luminaPP.png'),
  Valor: require('../assets/valorPP.png'),
};




const Chat = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [points, setPoints] = useState(route.params?.points || 0);
  const [tasks, setTasks] = useState(route.params?.tasks || []);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const progress = useRef(new Animated.Value(0)).current;
  const userInfo = route.params?.userInfo || {};
  const { name = "User", email = "dummy@outlook.com", height = 0, weight = 0, bmi = 0, 
          exerciseLevel = "unknown", house = "unknown", selectedOptions = [], 
          recommended_calories_per_day = 2000 } = userInfo;

  const trainerAvatar = trainerAvatars[house] || trainerAvatars.Nova;
  const encodedEmail = encodeEmail(email);

  const getBackgroundImage = () => backgroundImages[house] || require('../assets/splash.png');

  const player = useVideoPlayer(getBackgroundImage(), player => {
    player.loop = false;
    player.play();
  });
  
  // Load chat history from Firebase
  const loadChatHistory = useCallback(async () => {
    try {
      const snapshot = await get(ref(db, `chats/${encodedEmail}`));
      if (snapshot.exists()) {
        setMessages(snapshot.val());
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      Alert.alert("Error", "Could not load chat history");
    }
  }, [encodedEmail]);

  // Real-time listener for chat updates
  useEffect(() => {
    const dbRef = ref(db, `chats/${encodedEmail}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.val());
      } else {
        console.log("No chat data found for:", encodedEmail);
      }
    }, (error) => {
      console.error("Firebase read failed:", error);
    });

    return () => unsubscribe();
  }, [encodedEmail]);

  // Initialize chat with welcome message if empty
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!name || !house || !selectedOptions.length) {
          throw new Error("Incomplete user information");
        }

        await loadChatHistory();

        if (messages.length === 0) {
          const prompt = `Hello ${name}, welcome to the House of ${house}! Based on your BMI of ${bmi}, activity level (${exerciseLevel}), and your selected goals (${selectedOptions.join(', ')}), I have tailored a fitness plan for you. Let's get started!`;

          const response = await getFitnessResponse({
            name,
            house,
            bmi,
            height,
            weight,
            exerciseLevel,
            selectedOptions,
            message: prompt,
          });

          const welcomeMessage = {
            id: generateId(),
            text: response?.response || "Hi Trainer! Let's get started!",
            sender: 'trainer'
          };

          await set(ref(db, `chats/${encodedEmail}`), [welcomeMessage]);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitialized(true);
      }
    };

    initializeChat();

    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();
  }, [name, house, selectedOptions]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const takePicture = useCallback(async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        alert('Camera permission required');
        return;
      }
    }

    try {
      const data = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
      const newImageMessage = { 
        id: generateId(), 
        imageUri: data.uri, 
        sender: 'user', 
        type: 'image' 
      };
      const updatedMessages = [...messages, newImageMessage];
      
      await set(ref(db, `chats/${encodedEmail}`), updatedMessages);
      setCameraVisible(false);
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert("Error", "Could not take picture");
    }
  }, [permission, messages, encodedEmail]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const newUserMessage = { id: generateId(), text: input, sender: 'user' };
    const updatedMessages = [...messages, newUserMessage];
    
    try {
      await set(ref(db, `chats/${encodedEmail}`), updatedMessages);
      setInput('');

      const response = await getFitnessResponse({ ...userInfo, message: input });
      
      if (response?.response) {
        const pointsEarned = response.counters?.points || 0;
        setPoints(prev => prev + pointsEarned);
        setTasks(response.dailyTasks || []);

        const botResponse = {
          id: generateId(),
          text: response.response,
          sender: 'trainer',
          points: pointsEarned,
          exerciseDetails: response.exerciseDetails,
          youtubeLink: response.youtubeLink,
        };

        const finalMessages = [...updatedMessages, botResponse];
        await set(ref(db, `chats/${encodedEmail}`), finalMessages);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.message.includes("network") 
        ? "Network error. Please check your connection." 
        : "Sorry, something went wrong. Please try again.";
      
      const errorMessageObj = { 
        id: generateId(), 
        text: errorMessage, 
        sender: 'trainer' 
      };
      const errorMessages = [...updatedMessages, errorMessageObj];
      await set(ref(db, `chats/${encodedEmail}`), errorMessages);
    } finally {
      setIsLoading(false);
    }
  }, [input, userInfo, messages, encodedEmail]);

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const handleTutorial = (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    const newMessage = {
      id: generateId(),
      text: message?.youtubeLink 
        ? "Here's a guided tutorial!" 
        : "Sorry, I couldn't find a tutorial for that exercise.",
      sender: "trainer",
      ...(message?.youtubeLink && { 
        youtubeLink: message.youtubeLink,
        type: "video" 
      })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCompleted = () => {
    setPoints(prev => prev + 5);
    const completedMessage = { 
      id: generateId(), 
      text: "Great job!", 
      sender: "trainer" 
    };
    
    // Update both local and Firebase state
    setMessages(prev => {
      const newMessages = [...prev, completedMessage];
      set(ref(db, `chats/${encodedEmail}`), newMessages);
      return newMessages;
    });
  };

  if (!initialized) {
    return (
      <View style={styles.LoadingPagecontainer}>
      <VideoView 
        style={styles.Loading_backgroundVideo} 
        player={player}
        resizeMode="cover"  // Ensure video fills the container
        allowsFullscreen={false}  // Disable for background
        allowsPictureInPicture={false}
      />
      <View style={styles.Loading_container}>
        <Text style={styles.Loading_welcomeText}>Hi {name}, welcome to {house}!</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressInterpolate }]} />
        </View>
      </View>
    </View>
    );
  }

  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.cameraPreview} ref={cameraRef}>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
              <Text style={styles.captureButtonText}>SNAP</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/gradientBG.png')} style={styles.backgroundImage}>
      <View style={styles.topNavContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Dashboard', {
            userInfo,
            points,
            tasks
          })}
        >
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.pointsContainer}>
          <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
          <Text style={styles.pointsText}>{points}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View key={message.id} style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}>
              <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {message.sender === 'user' ? (
                    <>
                      <View style={styles.userBubble}>
                        <Text style={styles.userText}>{message.text}</Text>
                      </View>
                      <Image source={trainerAvatar} style={styles.profilePic} />
                    </>
                  ) : (
                    <>
                      <Image source={trainerAvatar} style={styles.profilePic} />
                      <View style={styles.trainerBubble}>
                        <Text style={styles.trainerText}>{message.text}</Text>
                      </View>
                    </>
                  )}
                </View>

                {message.type === 'video' && message.youtubeLink && (
                  <View style={styles.videoContainer}>
                    <WebView
                      source={{ uri: convertToEmbedUrl(message.youtubeLink) }}
                      style={styles.webView}
                      allowsFullscreenVideo
                      javaScriptEnabled
                    />
                  </View>
                )}

                {message.type === 'image' && (
                  <Image source={{ uri: message.imageUri }} style={styles.capturedImage} />
                )}

                {message.exerciseDetails && (
                  <View style={styles.exerciseContainer}>
                    <View style={styles.exerciseDetailsBox}>
                      {Array.isArray(message.exerciseDetails) ? (
                        message.exerciseDetails.map((exercise, i) => (
                          <Text key={`${message.id}-ex-${i}`} style={styles.exerciseDetailsText}>
                            {exercise.exercise} - {exercise.sets} sets of {exercise.reps} reps
                          </Text>
                        ))
                      ) : (
                        message.exerciseDetails.exercise && (
                          <Text style={styles.exerciseDetailsText}>
                            {message.exerciseDetails.exercise} - {message.exerciseDetails.sets} sets of {message.reps} reps
                          </Text>
                        )
                      )}
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={styles.completedButton} 
                        onPress={() => handleCompleted(message.id)}
                      >
                        <Text style={styles.buttonText}>Completed</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.tutorialButton} 
                        onPress={() => handleTutorial(message.id)}
                      >
                        <Text style={styles.buttonText}>Need Tutorial</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <>
              <TouchableOpacity 
                onPress={() => setCameraVisible(true)} 
                style={styles.cameraButton}
              >
                <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your questions..."
                placeholderTextColor="#888"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity 
                onPress={sendMessage} 
                style={styles.sendButton}
                disabled={!input.trim()}
              >
                <Image source={require('../assets/send.png')} style={styles.sendIcon} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default React.memo(Chat);
