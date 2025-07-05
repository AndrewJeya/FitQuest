import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
import YoutubePlayer from 'react-native-youtube-iframe';

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
      setShowTutorial((prev) => !prev);
    } else {
      onTutorial();
    }
  };

  const renderMessageContent = () => {
    if (message.type === 'image') {
      return (
        <Image 
          source={{ uri: message.imageUri }} 
          style={styles.messageImage}
          resizeMode="cover"
          accessibilityLabel="User sent image"
        />
      );
    }

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
        <Image source={require('../../assets/user.png')} style={styles.profilePic} accessibilityLabel="User avatar" />
        <View style={styles.userMessage}>
          {renderMessageContent()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.trainerMessageContainer}>
      <Image source={trainerAvatar} style={styles.trainerAvatar} accessibilityLabel="Trainer avatar" />
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

        {showTutorial && message.youtubeLink && (
          <View style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden' }}>
            <YoutubePlayer
              height={124}
              width={220}
              play={true}
              videoId={getYoutubeId(message.youtubeLink)}
              webViewStyle={{ borderRadius: 12 }}
              initialPlayerParams={{ controls: true, modestbranding: true }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

function getYoutubeId(url) {
  const match = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
  return match ? match[1] : null;
}

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
  },
  trainerMessage: {
    flex: 1,
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
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
  exerciseCard: {
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginTop: SPACING.SM,
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
  },
  pointsText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZES.SM,
    fontWeight: 'bold',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.SM,
  },
});

export default Message; 