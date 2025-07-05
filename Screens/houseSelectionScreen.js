import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, HOUSE_CONFIG } from '../constants';
import { normalizeHouseName, getHouseConfig } from '../utils/helpers';
import { Button, Card } from '../components/common';
import { globalStyles } from '../styles/globalStyles';
import { set, ref } from 'firebase/database';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import SwipeButton from 'rn-swipe-button';

const HouseSelectionScreen = ({ route, navigation }) => {
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

  const handleConfirmHouse = async () => {
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      console.error('No authenticated user found');
      return;
    }

    // Save complete user data to Firebase
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
      createdAt: new Date().toISOString(),
    };

    try {
      await set(ref(db, `users/${userId}`), completeUserData);
      console.log('User data saved successfully:', completeUserData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }

    navigation.navigate('PostHouseLoading', {
      userId: userId,
      userInfo: completeUserData,
    });
  };

  const InfoBox = ({ label, value, icon }) => (
    <View style={styles.infoBox}>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <Image source={icon} style={styles.infoIcon} />
    </View>
  );

  return (
    <ImageBackground source={require('../assets/hselectionBG.png')} style={globalStyles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Based on your selections, you belong to</Text>
        <Text style={styles.houseName}>{houseConfig.name}</Text>

        {/* Main Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.overflowContainer} />
          <Card variant="glass" padding="large" style={styles.cardContainer}>
            
            {/* House Crest */}
            <Image source={houseConfig.crest} style={styles.houseImage} />

            {/* Justification */}
            <Text style={styles.justificationText}>{justification}</Text>

            {/* Trainer Info Section */}
            <View style={styles.trainerContainer}>
              <View>
                <Text style={styles.trainerLabel}>Trainer</Text>
                <Text style={styles.trainerName}>{houseConfig.trainer}</Text>
              </View>
              <Image source={houseConfig.avatar} style={styles.trainerAvatar} />
            </View>

            {/* BMI & Calories Section */}
            <View style={styles.infoContainer}>
              <InfoBox
                label="Target\nBMI"
                value={target_bmi}
                icon={require('../assets/bullseye.png')}
              />
              <InfoBox
                label="Daily\nCalories"
                value={`${recommended_calories_per_day} kcal`}
                icon={require('../assets/fire.png')}
              />
            </View>
          </Card>
          <View style={styles.overflowContainer} />
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <SwipeButton
            containerStyles={{
              width: '100%',
              borderRadius: 16,
              backgroundColor: '#23262A',
              marginTop: 24,
            }}
            height={56}
            railBackgroundColor="#23262A"
            railBorderColor="#23262A"
            railFillBackgroundColor="#03C988"
            railFillBorderColor="#03C988"
            thumbIconBackgroundColor="#03C988"
            thumbIconBorderColor="#03C988"
            title="Slide to confirm house"
            titleColor="#fff"
            titleFontSize={16}
            onSwipeSuccess={handleConfirmHouse}
            thumbIconImageSource={require('../assets/arrow_forward_ios.png')}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    marginTop: 0,
    paddingTop: 0,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
    marginTop: 0,
    paddingTop: 0,
  },
  houseName: {
    fontSize: FONT_SIZES.XXXL,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    marginTop: SPACING.SM,
  },
  overflowContainer: {
    width: 100,
    height: 475,
    backgroundColor: COLORS.BACKGROUND.PROGRESS,
    borderRadius: 7,
    marginHorizontal: SPACING.MD,
  },
  cardContainer: {
    width: 274,
    height: 475,
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.MD,
    justifyContent: 'flex-start',
  },
  houseImage: {
    width: 150,
    height: 150,
    marginBottom: SPACING.LG,
    marginTop: SPACING.MD,
  },
  justificationText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    paddingHorizontal: SPACING.SM,
  },
  trainerContainer: {
    width: '100%',
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: 7,
    padding: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.LG,
  },
  trainerLabel: {
    fontSize: FONT_SIZES.SM,
    color: '#BBBBBB',
  },
  trainerName: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: '#D9D9D9',
    marginTop: 2,
  },
  trainerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 0,
    width: '100%',
    justifyContent: 'space-between',
  },
  infoBox: {
    width: '48%',
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: 7,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  infoTextContainer: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: FONT_SIZES.SM,
    color: '#BBBBBB',
    lineHeight: 18,
  },
  infoValue: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: '#D9D9D9',
    marginTop: 4,
  },
  infoIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 5,
    right: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
  },
});

export default HouseSelectionScreen;
