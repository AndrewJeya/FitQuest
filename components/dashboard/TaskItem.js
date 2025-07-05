import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, TYPOGRAPHY } from '../../constants';

const TaskItem = ({
  time,
  emoji,
  title,
  completed = false,
  style,
  timeStyle,
  titleStyle,
  emojiStyle,
  onMealPhoto,
  isMealTask = false,
  onToggle,
}) => {
  const containerStyle = [
    styles.container,
    completed && styles.completed,
    style
  ];

  const titleTextStyle = [
    styles.title,
    completed && styles.completedTitle,
    titleStyle
  ];

  const timeTextStyle = [
    styles.time,
    completed && styles.completedTime,
    timeStyle
  ];

  const isMeal = isMealTask || (typeof title === 'string' && (
    title.toLowerCase().includes('meal') ||
    title.toLowerCase().includes('breakfast') ||
    title.toLowerCase().includes('lunch') ||
    title.toLowerCase().includes('dinner') ||
    title.toLowerCase().includes('eat') ||
    title.toLowerCase().includes('food')
  ));

  const handleToggle = () => {
    if (onToggle) {
      onToggle(title, !completed);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={timeTextStyle}>{time}</Text>
      <TouchableOpacity 
        style={containerStyle} 
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.emojiContainer, emojiStyle]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={titleTextStyle}>{title}</Text>
        
        {/* Action Buttons */}
        {!completed && isMeal && onMealPhoto && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.mealButton} 
              onPress={onMealPhoto}
            >
              <Text style={styles.buttonText}>📸 Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {completed && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✅ Completed</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY.CARD,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    flex: 1,
    flexWrap: 'wrap',
  },
  completed: {
    opacity: 0.6,
  },
  time: {
    color: COLORS.GRAY.MEDIUM,
    marginRight: SPACING.SM,
    width: 50,
    ...TYPOGRAPHY.CAPTION,
  },
  completedTime: {
    textDecorationLine: 'line-through',
  },
  emojiContainer: {
    backgroundColor: COLORS.BACKGROUND.PROGRESS,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.ROUND,
    marginRight: SPACING.MD,
  },
  emoji: {
    fontSize: FONT_SIZES.SM,
  },
  title: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BODY_MEDIUM,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.SM,
    width: '100%',
  },
  mealButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    flex: 1,
  },
  buttonText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BUTTON_SMALL,
    textAlign: 'center',
  },
  completedContainer: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginTop: SPACING.SM,
    width: '100%',
  },
  completedText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BUTTON_SMALL,
  },
});

export default TaskItem; 