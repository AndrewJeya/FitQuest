import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const TaskItem = ({
  time,
  emoji,
  title,
  completed = false,
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

  return (
    <View style={styles.wrapper}>
      <Text style={timeTextStyle}>{time}</Text>
      <View style={containerStyle}>
        <View style={[styles.emojiContainer, emojiStyle]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={titleTextStyle}>{title}</Text>
      </View>
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