import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, WEEK_DAYS, TYPOGRAPHY } from '../../constants';

const WeekProgress = ({
  progressData = [],
  style,
  dayStyle,
  progressStyle,
  textStyle,
}) => {
  const renderDay = (day) => {
    const dayData = progressData.find(d => typeof d.day === 'string' && d.day.toLowerCase().includes(day.key.slice(0, 2)));
    const progress = dayData ? dayData.progress : 0;
    const isToday = day.key === getCurrentDayKey();
    
    const dayContainerStyle = [
      styles.day,
      isToday && styles.today,
      dayStyle
    ];

    const progressContainerStyle = [
      styles.progressContainer,
      isToday && styles.todayProgress,
      progressStyle
    ];

    const progressTextStyle = [
      styles.progressText,
      isToday && styles.todayProgressText,
      textStyle
    ];

    return (
      <View key={day.key} style={styles.dayWrapper}>
        <Text style={[styles.dayText, textStyle]}>{day.abbr}</Text>
        <View style={progressContainerStyle}>
          <Text style={progressTextStyle}>{progress}%</Text>
        </View>
      </View>
    );
  };

  const getCurrentDayKey = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
  };

  return (
    <View style={[styles.container, style]}>
      {WEEK_DAYS.map(renderDay)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
    marginTop: SPACING.MD,
  },
  dayWrapper: {
    alignItems: 'center',
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  today: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  dayText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BODY_SMALL,
  },
  progressContainer: {
    backgroundColor: COLORS.BACKGROUND.PROGRESS,
    borderColor: 'rgba(217, 217, 217, 0.08)',
    borderWidth: 1,
    height: 36,
    width: 36,
    borderRadius: BORDER_RADIUS.ROUND,
    marginTop: SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayProgress: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  progressText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.CAPTION,
  },
  todayProgressText: {
    color: COLORS.PRIMARY,
    ...TYPOGRAPHY.CAPTION_BOLD,
  },
});

export default WeekProgress; 