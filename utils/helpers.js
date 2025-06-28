import { HOUSE_CONFIG, HOUSES } from '../constants';

// Generate unique ID for messages and other items
export const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// Calculate BMI
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Format date
export const formatDate = (date = new Date()) => {
  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

// Get current time in HH:MM AM/PM format
export const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Normalize house name
export const normalizeHouseName = (house) => {
  if (!house) return HOUSES.NOVA;
  const formattedHouse = house.trim().replace(/^House of /i, '');
  return formattedHouse.charAt(0).toUpperCase() + formattedHouse.slice(1).toLowerCase();
};

// Get house configuration
export const getHouseConfig = (house) => {
  const normalizedHouse = normalizeHouseName(house);
  return HOUSE_CONFIG[normalizedHouse] || HOUSE_CONFIG[HOUSES.NOVA];
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters' };
  return { isValid: true, message: 'Password is valid' };
};

// Sanitize URL
export const sanitizeURL = (url) => {
  if (!url) return "";
  try {
    new URL(url);
    return url;
  } catch (_) {
    return "";
  }
};

// Convert YouTube URL to embed URL
export const convertToEmbedUrl = (url) => {
  if (!url || url === "null") return "";
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : "";
};

// Calculate progress percentage
export const calculateProgress = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

// Format calories
export const formatCalories = (calories) => {
  return `${calories} kcal`;
};

// Format BMI
export const formatBMI = (bmi) => {
  return bmi ? `${bmi}` : '0';
};

// Get BMI category
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}; 