import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const ProgressBar = ({
  progress = 0,
  total = 100,
  showPercentage = false,
  height = 8,
  backgroundColor = COLORS.GRAY.TRANSPARENT,
  progressColor = COLORS.PRIMARY,
  style,
  textStyle,
  animated = true,
  duration = 1000,
}) => {
  const [animatedValue] = React.useState(new Animated.Value(0));
  const percentage = total > 0 ? Math.min((progress / total) * 100, 100) : 0;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, total, animated, duration]);

  const progressWidth = animated 
    ? animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      })
    : `${percentage}%`;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
              backgroundColor: progressColor,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentageText, textStyle]}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  progressContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.ROUND,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: BORDER_RADIUS.ROUND,
  },
  percentageText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default ProgressBar; 