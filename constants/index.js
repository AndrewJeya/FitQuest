// App Constants
export const APP_NAME = 'FitQuest';

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
    crest: require('../assets/houseofnova.png')
  },
  [HOUSES.LUMINA]: {
    name: 'House of Lumina',
    trainer: 'Serene',
    focus: 'Flexibility, mindfulness, and holistic well-being',
    background: require('../assets/luminaBG.mp4'),
    avatar: require('../assets/luminaAI.png'),
    crest: require('../assets/houseoflumina.png')
  },
  [HOUSES.VALOR]: {
    name: 'House of Valor',
    trainer: 'Maximus',
    focus: 'Strength, endurance, and resilience',
    background: require('../assets/valorBG.mp4'),
    avatar: require('../assets/valorAI.png'),
    crest: require('../assets/houseofvalor.png')
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
  XXXL: 28
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