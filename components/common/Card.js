import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';

const Card = ({
  children,
  variant = 'solid', // 'solid', 'glass', 'outline'
  padding = 'md', // 'sm', 'md', 'lg', 'none'
  style,
  ...props
}) => {
  const variantStyles = {
    solid: styles.solid,
    glass: styles.glass,
    outline: styles.outline,
  };
  const paddingStyles = {
    none: {},
    sm: { padding: SPACING.SM },
    md: { padding: SPACING.MD },
    lg: { padding: SPACING.LG },
  };
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  solid: {
    backgroundColor: COLORS.BACKGROUND.CARD,
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
});

export default Card; 