import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

const Stepper = ({ 
  steps = 4, 
  currentStep = 1, 
  style,
  activeColor = COLORS.WHITE,
  inactiveColor = COLORS.GRAY.TRANSPARENT,
  stepHeight = 3,
  stepSpacing = SPACING.XS,
}) => {
  const renderSteps = () => {
    const stepElements = [];
    
    for (let i = 1; i <= steps; i++) {
      const isActive = i <= currentStep;
      const stepStyle = [
        styles.step,
        {
          height: stepHeight,
          marginHorizontal: stepSpacing,
          backgroundColor: isActive ? activeColor : inactiveColor,
        },
      ];
      
      stepElements.push(
        <View key={i} style={stepStyle} />
      );
    }
    
    return stepElements;
  };

  return (
    <View style={[styles.container, style]}>
      {renderSteps()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  step: {
    flex: 1,
    borderRadius: 2,
  },
});

export default Stepper; 