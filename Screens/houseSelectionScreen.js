import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, Animated, Alert, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, HOUSE_CONFIG } from '../constants';
import { normalizeHouseName, getHouseConfig } from '../utils/helpers';
import { Button, Card } from '../components/common';
import { globalStyles } from '../styles/globalStyles';
import { set, ref } from 'firebase/database';
import { db } from '../firebaseConfig';
import * as Haptics from 'expo-haptics';

const HouseSelectionScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));

  const {
    name = "Unknown",
    email = "N/A",
    height = 0,
    weight = 0,
    bmi = 0,
    exerciseLevel = "N/A",
    selectedOptions = [],
    house = "Nova",
    trainer = "Default Trainer",
    recommended_calories_per_day = 2000,
    target_bmi = 22,
    justification = "You belong here!",
  } = route.params || {};

  const normalizedHouse = normalizeHouseName(house);
  const houseConfig = getHouseConfig(normalizedHouse);

  // Start animations when component mounts
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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleConfirmHouse = async () => {
    if (isLoading) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      console.error('No authenticated user found');
      Alert.alert('Error', 'User authentication failed. Please try again.');
      setIsLoading(false);
      return;
    }

    // Enhanced user data with better structure
    const completeUserData = {
      name,
      email,
      height,
      weight,
      bmi,
      exerciseLevel,
      house: normalizedHouse,
      trainer: houseConfig.trainer,
      recommended_calories_per_day,
      target_bmi,
      justification,
      selectedOptions,
      points: 0, // Initialize points
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null
      },
      dailyProgress: {
        tasksCompleted: 0,
        totalTasks: 0,
        caloriesLogged: 0,
        exercisesCompleted: 0
      },
      preferences: {
        notifications: true,
        reminderTime: '09:00',
        theme: 'dark'
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    try {
      // Save user data to Firebase
      await set(ref(db, `users/${userId}`), completeUserData);
      console.log('User data saved successfully:', completeUserData);

      // Show success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to loading screen with enhanced data
      navigation.navigate('LoadingScreen', { 
        userId, 
        userInfo: completeUserData,
        isNewUser: true
      });
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const InfoBox = ({ label, value, icon, color = COLORS.PRIMARY }) => (
    <Animated.View 
      style={[
        styles.infoBox,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, { color }]}>{value}</Text>
      </View>
      <Image source={icon} style={styles.infoIcon} />
    </Animated.View>
  );

  return (
    <ImageBackground 
      source={require('../assets/hselectionBG.png')} 
      style={globalStyles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>House Assignment</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Based on your selections, you belong to</Text>
          <Text style={styles.houseName}>{houseConfig.name}</Text>

          {/* Main Card */}
          <View style={styles.cardWrapper}>
            <View style={styles.overflowContainer} />
            <Card variant="glass" padding="large" style={styles.cardContainer}>
              
              {/* House Crest */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Image source={houseConfig.crest} style={styles.houseImage} />
              </Animated.View>

              {/* Justification */}
              <View style={{ width: '100%', maxHeight: 120, marginBottom: 16 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.justificationText}>{justification}</Text>
                </ScrollView>
              </View>

              {/* Trainer Info Section */}
              <View style={styles.trainerContainer}>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerLabel}>Your AI Trainer</Text>
                  <Text style={styles.trainerName}>{houseConfig.trainer}</Text>
                  <Text style={styles.trainerDescription}>
                    Specialized in {normalizedHouse} training methods
                  </Text>
                </View>
                <Image source={houseConfig.avatar} style={styles.trainerAvatar} />
              </View>

              {/* BMI & Calories Section */}
              <View style={styles.infoContainer}>
                <InfoBox
                  label="Target\nBMI"
                  value={target_bmi}
                  icon={require('../assets/bullseye.png')}
                  color={COLORS.SUCCESS}
                />
                <InfoBox
                  label="Daily\nCalories"
                  value={`${recommended_calories_per_day} kcal`}
                  icon={require('../assets/fire.png')}
                  color={COLORS.WARNING}
                />
              </View>

              {/* House Benefits */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>House Benefits</Text>
                <View style={styles.benefitsList}>
                  <Text style={styles.benefitItem}>• Personalized training plans</Text>
                  <Text style={styles.benefitItem}>• AI-powered guidance</Text>
                  <Text style={styles.benefitItem}>• Progress tracking</Text>
                  <Text style={styles.benefitItem}>• Community support</Text>
                </View>
              </View>
            </Card>
            <View style={styles.overflowContainer} />
          </View>

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "Setting up your profile..." : "Confirm House"}
              onPress={handleConfirmHouse}
              size="large"
              style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
              disabled={isLoading}
            />
            <Text style={styles.buttonSubtext}>
              Your AI trainer will be ready in a moment
            </Text>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XL,
    paddingBottom: SPACING.MD,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  houseName: {
    fontSize: FONT_SIZES.XXXL,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginBottom: SPACING.LG,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  overflowContainer: {
    width: 100,
    height: 520,
    backgroundColor: COLORS.BACKGROUND.PROGRESS,
    borderRadius: 7,
    marginHorizontal: SPACING.MD,
  },
  cardContainer: {
    width: 274,
    height: 520,
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  houseImage: {
    width: 120,
    height: 120,
    marginBottom: SPACING.MD,
    marginTop: SPACING.MD,
  },
  justificationText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    textAlign: 'center',
    paddingHorizontal: SPACING.SM,
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  trainerContainer: {
    width: '100%',
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: 7,
    padding: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.LIGHT,
    marginBottom: 2,
  },
  trainerName: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trainerDescription: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.LIGHT,
    fontStyle: 'italic',
  },
  trainerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: SPACING.SM,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.MD,
  },
  infoBox: {
    flex: 1,
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: 7,
    padding: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.LIGHT,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.SM,
    fontWeight: 'bold',
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: 7,
    padding: SPACING.SM,
  },
  benefitsTitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  benefitsList: {
    alignItems: 'flex-start',
  },
  benefitItem: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.LIGHT,
    marginBottom: 2,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.GRAY.MEDIUM,
    shadowOpacity: 0.1,
  },
  buttonSubtext: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
});

export default HouseSelectionScreen;
