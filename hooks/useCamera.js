import { useState, useRef, useCallback } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';

export const useCamera = () => {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const openCamera = useCallback(() => {
    setCameraVisible(true);
  }, []);

  const closeCamera = useCallback(() => {
    setCameraVisible(false);
  }, []);

  const takePicture = useCallback(async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return null;
      }
    }

    try {
      if (!cameraRef.current) {
        throw new Error('Camera not ready');
      }

      const data = await cameraRef.current.takePictureAsync({ 
        quality: 0.5, 
        base64: true 
      });
      
      return data.uri;
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Could not take picture. Please try again.');
      return null;
    }
  }, [permission, requestPermission]);

  return {
    cameraVisible,
    cameraRef,
    permission,
    openCamera,
    closeCamera,
    takePicture,
  };
}; 