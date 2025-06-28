import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const ChatInput = ({
  onSend,
  onCameraPress,
  isLoading = false,
  disabled = false,
  placeholder = "Type a message...",
  style,
  inputStyle,
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading || disabled) return;
    
    onSend(input);
    setInput('');
  };

  const handleCameraPress = () => {
    if (isLoading || disabled) return;
    onCameraPress();
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.cameraButton, (isLoading || disabled) && styles.disabledButton]}
        onPress={handleCameraPress}
        disabled={isLoading || disabled}
      >
        <Image
          source={require('../../assets/camera.png')}
          style={styles.cameraIcon}
        />
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          (isLoading || disabled) && styles.disabledInput,
          inputStyle
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.GRAY.MEDIUM}
        value={input}
        onChangeText={setInput}
        editable={!isLoading && !disabled}
        multiline={false}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!input.trim() || isLoading || disabled) && styles.disabledSendButton
        ]}
        onPress={handleSend}
        disabled={!input.trim() || isLoading || disabled}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.WHITE} />
        ) : (
          <Image
            source={require('../../assets/send.png')}
            style={styles.sendIcon}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.SM,
    paddingRight: SPACING.XS,
    paddingVertical: SPACING.XS,
    backgroundColor: 'rgba(36, 40, 47, 0.6)',
    borderRadius: BORDER_RADIUS.MD,
    marginHorizontal: SPACING.XS,
    marginBottom: SPACING.LG,
  },
  cameraButton: {
    marginHorizontal: SPACING.XS,
    marginVertical: SPACING.XS,
    padding: SPACING.XS,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cameraIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.WHITE,
  },
  input: {
    flex: 1,
    padding: SPACING.SM,
    borderRadius: 20,
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    maxHeight: 100,
  },
  disabledInput: {
    opacity: 0.5,
  },
  sendButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    marginLeft: SPACING.SM,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: COLORS.GRAY.MEDIUM,
    opacity: 0.5,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.WHITE,
  },
});

export default ChatInput; 