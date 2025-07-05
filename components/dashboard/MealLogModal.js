import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

const MealLogModal = ({ visible, onClose, mealTask, onMealApproved, cameraRef, takePicture }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('camera'); // 'camera' or 'preview'

  const handleTakePicture = async () => {
    setIsLoading(true);
    try {
      const uri = await takePicture();
      if (uri) {
        setPhotoUri(uri);
        setStep('preview');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setStep('camera');
  };

  const handleSendToTrainer = async () => {
    setIsLoading(true);
    try {
      // Send meal photo and task info to trainer via chat
      const mealData = {
        task: mealTask,
        photoUri: photoUri,
        timestamp: new Date().toISOString(),
      };
      
      // This will be handled by the parent component
      await onMealApproved(mealData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to send meal to trainer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhotoUri(null);
    setStep('camera');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'camera' ? 'Take Meal Photo' : 'Review Photo'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === 'camera' ? (
            <>
              <View style={styles.mealInfo}>
                <Text style={styles.mealEmoji}>{mealTask?.emoji}</Text>
                <Text style={styles.mealTitle}>{mealTask?.title}</Text>
                <Text style={styles.mealTime}>{mealTask?.time}</Text>
              </View>
              
              <View style={styles.cameraContainer}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                />
                <View style={styles.cameraOverlay}>
                  <View style={styles.captureFrame} />
                </View>
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleTakePicture}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.WHITE} />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.mealInfo}>
                <Text style={styles.mealEmoji}>{mealTask?.emoji}</Text>
                <Text style={styles.mealTitle}>{mealTask?.title}</Text>
                <Text style={styles.mealTime}>{mealTask?.time}</Text>
              </View>

              <View style={styles.previewContainer}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              </View>

              <View style={styles.previewControls}>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetake}
                >
                  <MaterialIcons name="refresh" size={20} color={COLORS.WHITE} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendToTrainer}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.WHITE} />
                  ) : (
                    <>
                      <MaterialIcons name="send" size={20} color={COLORS.WHITE} />
                      <Text style={styles.sendText}>Send to Trainer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    paddingTop: 50,
  },
  closeButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.MD,
  },
  mealInfo: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  mealEmoji: {
    fontSize: 48,
    marginBottom: SPACING.SM,
  },
  mealTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  mealTime: {
    color: COLORS.GRAY.MEDIUM,
    fontSize: FONT_SIZES.MD,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    marginBottom: SPACING.LG,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: 'transparent',
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: SPACING.LG,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.WHITE,
  },
  previewContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    marginBottom: SPACING.LG,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: SPACING.LG,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY.DARK,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  retakeText: {
    color: COLORS.WHITE,
    marginLeft: SPACING.SM,
    fontSize: FONT_SIZES.MD,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  sendText: {
    color: COLORS.WHITE,
    marginLeft: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
});

export default MealLogModal; 