// screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { ref, get } from 'firebase/database';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const logoScale = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const auth = getAuth();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve user data using UID
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Check if user has complete profile data
        if (!userData.name || !userData.house || !userData.selectedOptions) {
          Alert.alert(
            'Complete Your Profile', 
            'Your profile is incomplete. Would you like to complete it now?',
            [
              {
                text: 'Complete Profile',
                onPress: () => {
                  // Navigate to UserInfo to complete the profile with existing data
                  navigation.navigate('UserInfo', { 
                    email: userData.email || user.email,
                    name: userData.name || 'User',
                    existingData: userData, // Pass existing data for pre-filling
                    isCompletingProfile: true
                  });
                }
              },
              {
                text: 'Skip for Now',
                onPress: () => {
                  // Navigate to Dashboard with available data
                  navigation.navigate('Dashboard', {
                    userInfo: userData,
                    isProfileIncomplete: true
                  });
                }
              }
            ]
          );
          return;
        }
        
        // Navigate with complete user data
        navigation.navigate('Dashboard', {
          userInfo: userData,
          isProfileComplete: true
        });
      } else {
        Alert.alert(
          'Profile Not Found', 
          'No profile data found. Would you like to create a new profile?',
          [
            {
              text: 'Create Profile',
              onPress: () => {
                // Navigate to UserInfo to create a new profile
                navigation.navigate('UserInfo', { 
                  email: user.email,
                  name: 'User',
                  isNewUser: true
                });
              }
            },
            {
              text: 'Cancel',
              onPress: () => {
                // Sign out and stay on login
                auth.signOut();
              },
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
        setEmailError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
        setPasswordError('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={require('../assets/loginBG.png')}
        style={styles.backgroundImage}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.centeredContent}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Let's continue your fitness journey</Text>
            </Animated.View>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>Email address</Text>
              <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isLoading}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              
              <TouchableOpacity 
                style={[styles.button, isLoading ? styles.buttonDisabled : null]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.XL,
    paddingBottom: SPACING.XL,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    backdropFilter: 'blur(10px)',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
    marginBottom: SPACING.SM,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    padding: SPACING.MD,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  eyeButton: {
    padding: SPACING.SM,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    marginBottom: SPACING.SM,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    marginTop: SPACING.MD,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.GRAY.MEDIUM,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: COLORS.GRAY.LIGHT,
    fontSize: 16,
  },
  signUpLink: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;