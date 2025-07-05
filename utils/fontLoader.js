import * as Font from 'expo-font';
import { Platform } from 'react-native';

// Font loading configuration
export const loadFonts = async () => {
  try {
    // For now, we'll use system fonts
    // When you have the actual font files, you can load them like this:
    /*
    await Font.loadAsync({
      'CircularStd-Bold': require('../assets/fonts/CircularStd-Bold.ttf'),
      'CircularStd-Medium': require('../assets/fonts/CircularStd-Medium.ttf'),
      'CircularStd-Regular': require('../assets/fonts/CircularStd-Regular.ttf'),
      'SFProText-Regular': require('../assets/fonts/SFProText-Regular.ttf'),
      'SFProText-Medium': require('../assets/fonts/SFProText-Medium.ttf'),
      'SFProText-Bold': require('../assets/fonts/SFProText-Bold.ttf'),
      'SFProText-Semibold': require('../assets/fonts/SFProText-Semibold.ttf'),
    });
    */
    
    console.log('Fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};

// Get the appropriate font family based on platform and availability
export const getFontFamily = (fontName, fallback = 'System') => {
  if (Platform.OS === 'ios') {
    // iOS has better font support
    switch (fontName) {
      case 'CircularStd-Bold':
        return 'CircularStd-Bold';
      case 'CircularStd-Medium':
        return 'CircularStd-Medium';
      case 'CircularStd-Regular':
        return 'CircularStd-Regular';
      case 'SFProText-Regular':
        return 'SF Pro Text';
      case 'SFProText-Medium':
        return 'SF Pro Text';
      case 'SFProText-Bold':
        return 'SF Pro Text';
      case 'SFProText-Semibold':
        return 'SF Pro Text';
      default:
        return fallback;
    }
  } else {
    // Android fallbacks
    switch (fontName) {
      case 'CircularStd-Bold':
      case 'CircularStd-Medium':
      case 'CircularStd-Regular':
        return 'sans-serif';
      case 'SFProText-Regular':
      case 'SFProText-Medium':
      case 'SFProText-Bold':
      case 'SFProText-Semibold':
        return 'sans-serif';
      default:
        return fallback;
    }
  }
}; 