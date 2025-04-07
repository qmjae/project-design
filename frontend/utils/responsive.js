import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design was created on)
const baseWidth = 360; // Based on standard medium-sized phone
const baseHeight = 800;

// Scale factors
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// Responsive dimension utilities
export const responsive = {
  // Width based scaling (good for horizontal measurements)
  w: (size) => PixelRatio.roundToNearestPixel(size * widthScale),
  
  // Height based scaling (good for vertical measurements)
  h: (size) => PixelRatio.roundToNearestPixel(size * heightScale),
  
  // Moderate scaling (prevents things from getting too large on tablets)
  m: (size) => PixelRatio.roundToNearestPixel(size * Math.min(widthScale, heightScale)),
  
  // Font scaling
  font: (size) => {
    const scale = Math.min(widthScale, heightScale);
    const newSize = size * scale;
    
    // Prevent fonts from getting too small on smaller devices
    // or too large on tablets
    if (Platform.OS === 'ios') {
      return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } 
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  },
  
  // Device info
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 350,
  isMediumDevice: SCREEN_WIDTH >= 350 && SCREEN_WIDTH < 500,
  isLargeDevice: SCREEN_WIDTH >= 500,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android'
};