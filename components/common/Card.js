import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    styles[`padding${capitalizeFirst(padding)}`],
    style
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: COLORS.GRAY.CARD,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Variants
  default: {
    backgroundColor: COLORS.GRAY.CARD,
  },
  elevated: {
    backgroundColor: COLORS.GRAY.CARD,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  glass: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Padding variants
  paddingSmall: {
    padding: SPACING.SM,
  },
  paddingMedium: {
    padding: SPACING.MD,
  },
  paddingLarge: {
    padding: SPACING.LG,
  },
  paddingXLarge: {
    padding: SPACING.XL,
  },
});

export default Card; 