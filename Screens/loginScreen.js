// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert,ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { ref, get } from 'firebase/database';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
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
            'Incomplete Profile', 
            'Your profile is incomplete. Please complete the signup process.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Sign out and redirect to signup
                  auth.signOut();
                  navigation.navigate('SignUp');
                }
              }
            ]
          );
          return;
        }
        
        // Navigate with complete user data
        navigation.navigate('Chat', { 
          userInfo: userData,
          userId: user.uid
        });
      } else {
        Alert.alert(
          'Profile Not Found', 
          'No profile data found. Please complete the signup process.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Sign out and redirect to signup
                auth.signOut();
                navigation.navigate('SignUp');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/loginBG.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Let's sign in to your account</Text>
          
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 60,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 40,
    backgroundColor: 'rgba(36, 40, 47, 0.69)',
    color: '#fff',
  },
  button: {
    backgroundColor: '#03C988',
    padding: 15,
    borderRadius: 10,
    marginTop:20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30, // Adjust this value if needed
  },
  linkText: {
    color: '#007BFF',
    textAlign: 'center',
  },
});

export default LoginScreen;