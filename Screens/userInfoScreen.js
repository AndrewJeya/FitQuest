import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert 
} from 'react-native';

const UserInfoScreen = ({ route, navigation }) => {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const { name, email } = route.params; // Get name & email

  const handleNext = () => {
    if (!age.trim() || !height.trim() || !weight.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseInt(weight);

    if (ageNum < 13 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age between 13 and 120');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('Error', 'Please enter a valid height between 100 and 250 cm');
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      Alert.alert('Error', 'Please enter a valid weight between 30 and 300 kg');
      return;
    }

    const bmi = (weightNum / ((heightNum / 100) ** 2)).toFixed(2);
    navigation.navigate('ExerciseLevel', { name, age, height, weight, bmi, email });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground source={require('../assets/signupBG.png')} style={styles.backgroundImage}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.centeredContent}>
              <View style={styles.stepperContainer}>
                <View style={[styles.step, styles.activeStep]} />
                <View style={[styles.step, styles.activeStep]} />
                <View style={[styles.step, styles.inactiveStep]} />
                <View style={[styles.step, styles.inactiveStep]} />
              </View>

              <Text style={styles.title}>Let's get to know you better</Text>

              <Text style={styles.label}>How old are you?</Text>
              <TextInput
                style={styles.input}
                placeholder="Type your age"
                placeholderTextColor="#888"
                onChangeText={setAge}
                keyboardType="numeric"
                returnKeyType="done"
              />

              <Text style={styles.label}>What's your height? (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Type your height"
                placeholderTextColor="#888"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                returnKeyType="done"
              />

              <Text style={styles.label}>What's your weight? (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Type your weight"
                placeholderTextColor="#888"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                returnKeyType="done"
              />

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1, 
    justifyContent: 'center',
    padding: 30,
  },
  centeredContent: {
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
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
    marginBottom: 20,
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

export default UserInfoScreen;
