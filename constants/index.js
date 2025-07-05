import { Platform } from 'react-native';
import { getFontFamily } from '../utils/fontLoader';

// App Constants
export const APP_NAME = 'FitQuest';

// Font Families
export const FONTS = {
  DISPLAY: getFontFamily('CircularStd-Bold', 'System'), // For headers, titles, and display text
  DISPLAY_MEDIUM: getFontFamily('CircularStd-Medium', 'System'), // For medium weight display text
  DISPLAY_REGULAR: getFontFamily('CircularStd-Regular', 'System'), // For regular weight display text
  BODY: getFontFamily('SFProText-Regular', 'System'), // For regular body text
  BODY_MEDIUM: getFontFamily('SFProText-Medium', 'System'), // For medium weight body text
  BODY_BOLD: getFontFamily('SFProText-Bold', 'System'), // For bold body text
  BODY_SEMIBOLD: getFontFamily('SFProText-Semibold', 'System'), // For semibold body text
};

// Font Weights (for platforms that don't support custom fonts)
export const FONT_WEIGHTS = {
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
};

// House Constants
export const HOUSES = {
  NOVA: 'Nova',
  LUMINA: 'Lumina', 
  VALOR: 'Valor'
};

export const HOUSE_CONFIG = {
  [HOUSES.NOVA]: {
    name: 'House of Nova',
    trainer: 'Lyra',
    focus: 'Agility, HIIT, and structured progress tracking',
    background: require('../assets/novaBG.mp4'),
    avatar: require('../assets/novaAI.png'),
    crest: require('../assets/houseofnova.png'),
    trainerProfile: require('../assets/novaPP.png')
  },
  [HOUSES.LUMINA]: {
    name: 'House of Lumina',
    trainer: 'Serene',
    focus: 'Flexibility, mindfulness, and holistic well-being',
    background: require('../assets/luminaBG.mp4'),
    avatar: require('../assets/luminaAI.png'),
    crest: require('../assets/houseoflumina.png'),
    trainerProfile: require('../assets/luminaPP.png')
  },
  [HOUSES.VALOR]: {
    name: 'House of Valor',
    trainer: 'Maximus',
    focus: 'Strength, endurance, and resilience',
    background: require('../assets/valorBG.mp4'),
    avatar: require('../assets/valorAI.png'),
    crest: require('../assets/houseofvalor.png'),
    trainerProfile: require('../assets/valorPP.png')
  }
};

// Exercise Levels
export const EXERCISE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};

// Colors
export const COLORS = {
  PRIMARY: '#03C988',
  PRIMARY_TRANSPARENT: 'rgba(3, 201, 136, 0.73)',
  PRIMARY_LIGHT: 'rgba(3, 201, 136, 0.24)',
  WHITE: '#fff',
  BLACK: '#000',
  GRAY: {
    LIGHT: '#B5B5B5',
    MEDIUM: '#888',
    DARK: '#333',
    TRANSPARENT: 'rgba(255, 255, 255, 0.16)',
    CARD: 'rgba(103, 122, 132, 0.19)',
    INPUT: 'rgba(36, 40, 47, 0.69)'
  },
  SUCCESS: '#C2F997',
  BACKGROUND: {
    DARK: 'rgba(0, 0, 0, 0.4)',
    CARD: 'rgba(255, 255, 255, 0.08)',
    PROGRESS: 'rgba(255, 255, 255, 0.1)'
  }
};

// Spacing
export const SPACING = {
  XS: 5,
  SM: 10,
  MD: 15,
  LG: 20,
  XL: 30,
  XXL: 40
};

// Border Radius
export const BORDER_RADIUS = {
  SM: 5,
  MD: 10,
  LG: 16,
  XL: 20,
  ROUND: 50
};

// Font Sizes
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 28,
  DISPLAY_SM: 32,
  DISPLAY_MD: 36,
  DISPLAY_LG: 42,
  DISPLAY_XL: 48
};

// Typography Styles
export const TYPOGRAPHY = {
  // Display styles (using Circular Std)
  DISPLAY_LARGE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.DISPLAY_XL,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  DISPLAY_MEDIUM: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.DISPLAY_LG,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  DISPLAY_SMALL: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.DISPLAY_MD,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  HEADING_1: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.XXXL,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  HEADING_2: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.XXL,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  HEADING_3: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.XL,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  HEADING_4: {
    fontFamily: FONTS.DISPLAY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  
  // Body styles (using SF Pro)
  BODY_LARGE: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_MEDIUM: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.MD,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_SMALL: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_XSMALL: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  
  // Button styles
  BUTTON_LARGE: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  BUTTON_MEDIUM: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.MD,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  BUTTON_SMALL: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  
  // Caption styles
  CAPTION: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  CAPTION_BOLD: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
};

// Week Days
export const WEEK_DAYS = [
  { key: 'mon', abbr: 'Mo' },
  { key: 'tue', abbr: 'Tu' },
  { key: 'wed', abbr: 'We' },
  { key: 'thu', abbr: 'Th' },
  { key: 'fri', abbr: 'Fr' },
  { key: 'sat', abbr: 'Sa' },
  { key: 'sun', abbr: 'Su' }
];

// Default Values
export const DEFAULTS = {
  CALORIES_PER_DAY: 2000,
  TARGET_BMI: 22,
  POINTS: 0,
  TASKS: []
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}; 