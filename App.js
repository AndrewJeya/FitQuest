import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, ImageBackground, Animated, Image, Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import notificationService from './utils/notificationService';
import { loadFonts } from './utils/fontLoader';
import Chat from './Screens/chat';
import HouseSelectionScreen from './Screens/houseSelectionScreen';
import SelectionScreen from './Screens/selectionScreen';
import LoginScreen from './Screens/loginScreen';
import SignUpScreen from './Screens/signUpScreen';
import UserInfoScreen from './Screens/userInfoScreen';
import BMIScreen from './Screens/BMIScreen';
import ExerciseLevelScreen from './Screens/exerciseLevelScreen';
import Dashboard from './Screens/dashboard';
import ProfileScreen from './Screens/profileScreen';
import StatsScreen from './Screens/statsScreen';
import LoadingScreen from './Screens/loadingScreen';
import MainTabNavigator from './components/navigation/MainTabNavigator';

const Stack = createNativeStackNavigator();

// Enhanced splash screen component with better animations
const SplashScreen = () => {
  const progress = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animations for better visual appeal
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [progress, logoScale, logoOpacity]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground
      source={require('./assets/loading.png')}
      style={styles.splashContainer}
    >
      <View style={styles.logoContainer}>
        <Animated.View style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }]
        }}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
        </Animated.View>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressInterpolate }]} />
      </View>
      
      <View style={styles.splashTextContainer}>
        <Animated.Text style={[styles.splashText, { opacity: logoOpacity }]}>
          Your AI Fitness Journey Starts Here
        </Animated.Text>
      </View>
    </ImageBackground>
  );
};

// Home screen styled the same as the splash screen, without welcome text or button
const HomeScreen = () => {
  return (
    <ImageBackground
      source={require('./assets/loading.png')}
      style={styles.splashContainer}
    >
      <View style={styles.logoContainer}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.progressBarContainer} />
    </ImageBackground>
  );
};

// Fallback screen for debugging
const FallbackScreen = () => {
  return (
    <View style={[styles.splashContainer, { backgroundColor: '#000' }]}>
      <View style={styles.logoContainer}>
        <Text style={{ color: 'white', fontSize: 24, textAlign: 'center' }}>
          Fallback Screen
        </Text>
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', marginTop: 20 }}>
          If you see this, there's an issue with the dashboard
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // Initialize app services
  useEffect(() => {
    const initApp = async () => {
      try {
        // Load fonts
        await loadFonts();
        
        // Initialize notifications
        await notificationService.initialize();
        console.log('App notifications initialized');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initApp();
  }, []);

  const onAuthStateChangedHandler = (user) => {
    console.log('App - Auth state changed:', { user: !!user, uid: user?.uid });
    // Always set user to null to force login screen
    setUser(null);
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

  console.log('App - Rendering navigation with user:', { user: !!user, uid: user?.uid });

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animationDuration: 300,
        }}
      >
        {user ? (
          // Authenticated flow with improved navigation
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={Dashboard}
              options={{
                animation: 'fade',
              }}
              initialParams={{ enableChatRedirect: true }}
            />
            <Stack.Screen 
              name="LoadingScreen" 
              component={LoadingScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen 
              name="UserInfo" 
              component={UserInfoScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="BMIScreen" 
              component={BMIScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Selection" 
              component={SelectionScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="HouseSelection" 
              component={HouseSelectionScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="ExerciseLevel" 
              component={ExerciseLevelScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Stats" 
              component={StatsScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={Chat}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          </>
        ) : (
          // Unauthenticated flow
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={Dashboard}
              options={{
                animation: 'fade',
              }}
              initialParams={{ enableChatRedirect: true }}
            />
            <Stack.Screen 
              name="LoadingScreen" 
              component={LoadingScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen 
              name="UserInfo" 
              component={UserInfoScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="BMIScreen" 
              component={BMIScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Selection" 
              component={SelectionScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="HouseSelection" 
              component={HouseSelectionScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="ExerciseLevel" 
              component={ExerciseLevelScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Stats" 
              component={StatsScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={Chat}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          
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
    marginBottom: 40,
  },
  logo: {
    width: 245,
    height: 208,
  },
  progressBarContainer: {
    width: 250,
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
  },
  splashTextContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  splashText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
