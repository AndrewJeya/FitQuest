// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { ref, set } from 'firebase/database';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save basic user data
      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
        name: name,
        createdAt: new Date().toISOString(),
      });
      
      // Navigate to UserInfo screen with email and name
      navigation.navigate('UserInfo', { email, name });
    } catch (error) {
      console.error('Error signing up:', error);
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
      <ImageBackground
        source={require('../assets/signupBG.png')}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.centeredContent}>
            <View style={styles.stepperContainer}>
              <View style={[styles.step, styles.activeStep]} />
              <View style={[styles.step, styles.inactiveStep]} />
              <View style={[styles.step, styles.inactiveStep]} />
              <View style={[styles.step, styles.inactiveStep]} />
            </View>

            <Text style={styles.title}>Let's create an account</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
            style={styles.input}
              placeholder="Type your first and last name"
              placeholderTextColor="#888"
              value={name}
            onChangeText={setName}
          />

            <Text style={styles.label}>Email address</Text>
            <TextInput
            style={styles.input}
              placeholder="Type your email"
              placeholderTextColor="#888"
              value={email}
            onChangeText={setEmail}
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

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Signin</Text>
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
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  step: {
    height: 3,
    flex: 1,
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#fff',
  },
  inactiveStep: {
    backgroundColor: 'background: rgba(255, 255, 255, 0.16);',
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
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    color: '#007BFF',
    textAlign: 'center',
  },
});

export default SignUpScreen;
