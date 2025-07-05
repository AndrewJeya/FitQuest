import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';

const CircularProgress = ({ 
  progress = 0, 
  size = 80, 
  strokeWidth = 8, 
  showText = true,
  style 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        ]}
      />
      
      {/* Progress circle */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.PRIMARY,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: COLORS.PRIMARY,
              borderTopColor: progress > 0 ? COLORS.PRIMARY : 'transparent',
              borderRightColor: progress > 25 ? COLORS.PRIMARY : 'transparent',
              borderBottomColor: progress > 50 ? COLORS.PRIMARY : 'transparent',
              borderLeftColor: progress > 75 ? COLORS.PRIMARY : 'transparent',
            },
          ]}
        />
      </View>
      
      {/* Center text */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  progressFill: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
});

export default CircularProgress; 