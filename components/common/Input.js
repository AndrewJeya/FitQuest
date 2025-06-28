import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  disabled = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  multiline = false,
  numberOfLines = 1,
  returnKeyType = 'default',
  onSubmitEditing,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
    style
  ];

  const inputTextStyle = [
    styles.input,
    disabled && styles.inputDisabled,
    inputStyle
  ];

  const labelTextStyle = [
    styles.label,
    disabled && styles.labelDisabled,
    labelStyle
  ];

  const errorTextStyle = [
    styles.error,
    errorStyle
  ];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={labelTextStyle}>{label}</Text>
      )}
      <View style={inputContainerStyle}>
        <TextInput
          style={inputTextStyle}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY.MEDIUM}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && (
        <Text style={errorTextStyle}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    marginBottom: SPACING.SM,
    fontWeight: '500',
  },
  labelDisabled: {
    color: COLORS.GRAY.MEDIUM,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY.DARK,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.GRAY.INPUT,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
  },
  inputContainerFocused: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.GRAY.INPUT,
  },
  inputContainerError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.GRAY.DARK,
    opacity: 0.6,
  },
  input: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    padding: 0,
    minHeight: 20,
  },
  inputDisabled: {
    color: COLORS.GRAY.MEDIUM,
  },
  error: {
    color: '#FF6B6B',
    fontSize: FONT_SIZES.SM,
    marginTop: SPACING.XS,
    marginLeft: SPACING.SM,
  },
});

export default Input; 