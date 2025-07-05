import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const TaskItem = ({
  time,
  emoji,
  title,
  completed = false,
  onToggleComplete,
  onMealLog,
  style,
  timeStyle,
  titleStyle,
  emojiStyle,
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

  // Check if this is a meal task
  const isMealTask = emoji === "🍳" || emoji === "🥗" || emoji === "🍽️" || 
                     title.toLowerCase().includes("breakfast") || 
                     title.toLowerCase().includes("lunch") || 
                     title.toLowerCase().includes("dinner") || 
                     title.toLowerCase().includes("meal") ||
                     title.toLowerCase().includes("eat");

  const handlePress = () => {
    if (isMealTask && onMealLog) {
      onMealLog({ time, emoji, title });
    } else if (onToggleComplete) {
      onToggleComplete();
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={timeTextStyle}>{time}</Text>
      <TouchableOpacity style={containerStyle} onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.emojiContainer, emojiStyle]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={titleTextStyle}>{title}</Text>
        <MaterialIcons
          name={completed ? 'check-circle' : (isMealTask ? 'camera-alt' : 'radio-button-unchecked')}
          size={22}
          color={completed ? '#22C55E' : (isMealTask ? '#FFD700' : '#A0A0A0')}
          style={{ marginLeft: 8 }}
        />
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
    width: 70,
    fontSize: FONT_SIZES.SM,
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
    fontSize: FONT_SIZES.MD,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
});

export default TaskItem; 