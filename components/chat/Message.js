import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const Message = ({ 
  message, 
  trainerAvatar, 
  onTutorial, 
  onCompleted, 
  isCompleted 
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const isUser = message.sender === 'user';
  const isError = message.isError;

  const handleTutorialPress = () => {
    if (message.youtubeLink) {
      Linking.openURL(message.youtubeLink);
    } else {
      onTutorial();
    }
  };

  const renderMessageContent = () => {
    // Handle meal logging messages
    if (message.type === 'meal_log') {
      return (
        <View style={styles.mealLogContainer}>
          <Text style={styles.messageText}>{message.text}</Text>
          {message.mealData?.photoUri && (
            <View style={styles.mealImageContainer}>
              <Image 
                source={{ uri: message.mealData.photoUri }} 
                style={styles.mealImage}
                resizeMode="cover"
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealEmoji}>{message.mealData.task?.emoji}</Text>
                <Text style={styles.mealTitle}>{message.mealData.task?.title}</Text>
                <Text style={styles.mealTime}>{message.mealData.task?.time}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    // Handle meal approval messages
    if (message.type === 'meal_approval') {
      return (
        <View style={styles.mealApprovalContainer}>
          <Text style={styles.messageText}>{message.text}</Text>
          {message.analysis && (
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisStatus}>
                  {message.analysis.approved ? '✅ Approved' : '❌ Needs Improvement'}
                </Text>
                <Text style={styles.calorieCount}>
                  {message.analysis.estimatedCalories} calories
                </Text>
              </View>
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>Feedback:</Text>
                <Text style={styles.feedbackText}>{message.analysis.feedback}</Text>
              </View>
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsLabel}>Suggestions:</Text>
                <Text style={styles.suggestionsText}>{message.analysis.suggestions}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    // Handle regular image messages
    if (message.type === 'image') {
      return (
        <Image 
          source={{ uri: message.imageUri }} 
          style={styles.messageImage}
          resizeMode="cover"
        />
      );
    }

    // Handle regular text messages
    return (
      <Text style={[
        styles.messageText,
        isError && styles.errorText
      ]}>
        {message.text}
      </Text>
    );
  };

  if (isUser) {
    return (
      <View style={styles.userMessageContainer}>
        <View style={styles.userMessage}>
          {renderMessageContent()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.trainerMessageContainer}>
      <Image source={trainerAvatar} style={styles.trainerAvatar} />
      <View style={styles.trainerMessage}>
        {renderMessageContent()}
        
        {/* Exercise Details */}
        {message.exerciseDetails && message.exerciseDetails.exercise && (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{message.exerciseDetails.exercise}</Text>
            <Text style={styles.exerciseDetails}>
              {message.exerciseDetails.sets} sets × {message.exerciseDetails.reps} reps
            </Text>
            
            {/* Action Buttons */}
            {!isCompleted && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => onCompleted(message.id)}
                >
                  <Text style={styles.buttonText}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, showTutorial && styles.activeTutorialButton]} 
                  onPress={handleTutorialPress}
                >
                  <Text style={styles.buttonText}>
                    {showTutorial ? 'Hide Tutorial' : 'Need Tutorial'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {isCompleted && (
              <View style={styles.completedContainer}>
                <Text style={styles.completedText}>✅ Completed</Text>
              </View>
            )}
          </View>
        )}

        {/* Points Display */}
        {message.points > 0 && (
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>+{message.points} points</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.MD,
    paddingHorizontal: SPACING.MD,
  },
  userMessage: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  trainerMessageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
    paddingHorizontal: SPACING.MD,
  },
  trainerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trainerMessage: {
    flex: 1,
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  messageText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    lineHeight: 22,
  },
  errorText: {
    color: COLORS.ERROR,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.MD,
  },
  // Meal logging styles
  mealLogContainer: {
    width: '100%',
  },
  mealImageContainer: {
    marginTop: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.MD,
  },
  mealInfo: {
    padding: SPACING.SM,
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 24,
    marginBottom: SPACING.XS,
  },
  mealTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
  },
  mealTime: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
  },
  // Meal approval styles
  mealApprovalContainer: {
    width: '100%',
  },
  analysisCard: {
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginTop: SPACING.SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  analysisStatus: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
  calorieCount: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
  feedbackSection: {
    marginBottom: SPACING.SM,
  },
  feedbackLabel: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.XS,
  },
  feedbackText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    fontStyle: 'italic',
  },
  suggestionsSection: {
    marginBottom: SPACING.XS,
  },
  suggestionsLabel: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.XS,
  },
  suggestionsText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
  },
  exerciseCard: {
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginTop: SPACING.SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
  },
  exerciseDetails: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.SM,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTutorialButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    textAlign: 'center',
  },
  completedContainer: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
  },
  pointsContainer: {
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    alignSelf: 'flex-start',
    marginTop: SPACING.SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZES.SM,
    fontWeight: 'bold',
  },
});

export default Message; 