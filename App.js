import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, ImageBackground, Animated, Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import notificationService from './utils/notificationService';
import Chat from './Screens/chat';
import HouseSelectionScreen from './Screens/houseSelectionScreen';
import SelectionScreen from './Screens/selectionScreen';
import LoginScreen from './Screens/loginScreen';
import SignUpScreen from './Screens/signUpScreen';
import UserInfoScreen from './Screens/userInfoScreen';
import BMIScreen from './Screens/BMIScreen';
import ExerciseLevelScreen from './Screens/exerciseLevelScreen';
import MainTabNavigator from './components/MainTabNavigator';
import PostHouseLoadingScreen from './Screens/PostHouseLoadingScreen';

const Stack = createNativeStackNavigator();

// Splash screen component with background image, logo, and progress bar
const SplashScreen = () => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000, // 3 seconds
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground
      source={require('./assets/loading.png')} // Update this to your background image path
      style={styles.splashContainer}
    >
      <View style={styles.logoContainer}>
        <Image source={require('./assets/logo.png')} style={styles.logo} /> 
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressInterpolate }]} />
      </View>
    </ImageBackground>
  );
};

// Home screen styled the same as the splash screen, without welcome text or button
const HomeScreen = () => {
  return (
    <ImageBackground
      source={require('./assets/loading.png')} // Use the same background image as splash
      style={styles.splashContainer}
    >
      <View style={styles.logoContainer}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.progressBarContainer} />
    </ImageBackground>
  );
};

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Initialize notifications when app starts
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('App notifications initialized');
      } catch (error) {
        console.error('Error initializing app notifications:', error);
      }
    };
    
    initNotifications();
  }, []);

  const onAuthStateChangedHandler = (user) => {
    setUser(user);
    if (initializing) {
      // Artificial delay to ensure splash screen is shown
      setTimeout(() => {
        setInitializing(false);
      }, 2000); // 2-second delay
    }
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber;
  }, []);

  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Authenticated flow
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="UserInfo" component={UserInfoScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BMIScreen" component={BMIScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Selection" component={SelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HouseSelection" component={HouseSelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ExerciseLevel" component={ExerciseLevelScreen} options={{ headerShown: false }} />
            {/* Chat screen moved here to ensure it's always available after auth */}
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
            <Stack.Screen name="PostHouseLoading" component={PostHouseLoadingScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // Unauthenticated flow
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
              initialParams={{ enableChatRedirect: true }}  // Add this flag
            />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            {/* Add Chat screen here too for pre-auth references if needed */}
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Add margin below the logo to create space for the progress bar
  },
  logo: {
    width: 245,
    height: 208,
  },
  progressBarContainer: {
    width: 250,
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background color
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Light gray color for the progress bar
    borderRadius: 4,
  },
});
