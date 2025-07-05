// screens/ExerciseLevelScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const levels = [
  { label: "Not Very Active", description: "Spend most of the day sitting (e.g., desk job, studying)." },
  { label: "Lightly Active", description: "Spend a good part of the day on your feet (e.g., teacher, retail)." },
  { label: "Active", description: "Spend a good part of the day doing some physical activity (e.g., food server, postal carrier)." },
  { label: "Very Active", description: "Spend most of the day doing heavy physical activity (e.g., construction, athlete)." },
];

const ExerciseLevelScreen = ({ navigation, route }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { age, name, height, weight, bmi, email } = route.params;

  const handleNext = () => {
    if (selectedLevel) {
      navigation.navigate('Selection', { age, name, email, height, weight, bmi, exerciseLevel: selectedLevel });
    }
  };

  return (
    <ImageBackground
      source={require('../assets/signupBG.png')} // Replace with the correct background image path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.stepperContainer}>
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.inactiveStep]} />
          </View>

          <Text style={styles.title}>How do you describe your activity level?</Text>
          {levels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.levelButton, selectedLevel === level.label && styles.selectedButton]}
              onPress={() => setSelectedLevel(level.label)}
            >
              <Text style={styles.levelText}>{level.label}</Text>
              <Text style={styles.descriptionText}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
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
    marginBottom: 48,
    marginTop:70,
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
    marginBottom: 30,
    textAlign: 'center',
  },
  levelButton: {
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectedButton: {
    borderColor: '#03C988',
    borderWidth: 2,
  },
  levelText: {
    fontSize: 18,
    marginBottom:1,
    color: '#fff',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#424548',
  },
  nextButton: {
    backgroundColor: '#03C988',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#03C988',
  },
  backButtonText: {
    color: '#03C988',
    fontSize: 18,
  },
});

export default ExerciseLevelScreen;
