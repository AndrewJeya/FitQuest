import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  children,
  ...props 
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      {children || <Text style={buttonTextStyle}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.MD,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.GRAY.MEDIUM,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    minHeight: 52,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.WHITE,
  },
  secondaryText: {
    color: COLORS.PRIMARY,
  },
  outlineText: {
    color: COLORS.GRAY.MEDIUM,
  },
  ghostText: {
    color: COLORS.PRIMARY,
  },
  
  // Text sizes
  smallText: {
    fontSize: FONT_SIZES.SM,
  },
  mediumText: {
    fontSize: FONT_SIZES.MD,
  },
  largeText: {
    fontSize: FONT_SIZES.LG,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.GRAY.MEDIUM,
  },
});

export default Button; 