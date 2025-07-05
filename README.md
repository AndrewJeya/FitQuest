# FitQuest - AI-Powered Fitness App

A React Native fitness application that combines gamification, AI personalization, and social elements to create an engaging fitness experience.

## 🏗️ Architecture Overview

The app has been refactored to follow clean code principles with reusable components and organized structure:

```
fitquest/
├── API/                    # API integration
├── assets/                 # Images, videos, animations
├── components/             # Reusable UI components
│   ├── common/            # Generic components (Button, Input, Card, etc.)
│   ├── dashboard/         # Dashboard-specific components
│   └── chat/              # Chat interface components
├── constants/             # App constants and configuration
├── hooks/                 # Custom React hooks
├── Screens/               # Screen components
├── styles/                # Global styles and themes
├── utils/                 # Utility functions and helpers
└── App.js                 # Main app component
```

## 🎯 Key Features

- **House System**: Users sorted into Nova, Lumina, or Valor houses
- **AI Personal Trainers**: Customized fitness guidance with Google Gemini AI integration
- **Gamified Experience**: Points system, daily tasks, progress tracking
- **Real-time Chat**: Interactive AI conversations with personalized responses
- **Camera Integration**: Meal verification and photo sharing
- **Progress Tracking**: Weekly progress, daily goals, and achievements

## 🧩 Reusable Components

### Common Components (`components/common/`)
- **Button**: Configurable button with multiple variants (primary, secondary, outline, ghost)
- **Input**: Form input with validation and error handling
- **Card**: Flexible card component with different styles (default, elevated, glass, transparent)
- **ProgressBar**: Animated progress indicators
- **Stepper**: Multi-step progress indicators

### Dashboard Components (`components/dashboard/`)
- **DataCard**: Metric display cards with progress bars
- **TaskItem**: Individual task display with completion status
- **WeekProgress**: Weekly progress visualization

### Chat Components (`components/chat/`)
- **Message**: Handles different message types (text, image, video, exercise details)
- **ChatInput**: Input interface with camera integration

## 🎨 Design System

### Constants (`constants/index.js`)
Centralized configuration for:
- **Colors**: Consistent color palette with transparency variants
- **Spacing**: Standardized spacing values
- **Typography**: Font sizes and weights
- **Border Radius**: Consistent border radius values
- **House Configuration**: House-specific assets and settings

### Global Styles (`styles/globalStyles.js`)
Reusable style patterns for:
- Layout components
- Text styles
- Button variants
- Input styles
- Card styles
- Progress indicators

## 🔧 Custom Hooks

### `hooks/useChat.js`
Manages chat functionality:
- Message state management
- Firebase real-time updates
- AI response handling
- Image message support
- Auto-scrolling

### `hooks/useCamera.js`
Handles camera operations:
- Permission management
- Photo capture
- Error handling

## 🛠️ Utility Functions (`utils/helpers.js`)

Common helper functions:
- **generateId()**: Unique ID generation
- **calculateBMI()**: BMI calculation
- **formatDate()**: Date formatting
- **normalizeHouseName()**: House name normalization
- **validateEmail()**: Email validation
- **convertToEmbedUrl()**: YouTube URL conversion
- **calculateProgress()**: Progress percentage calculation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native development environment
- Expo CLI
- Firebase project setup

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Setup
Create a `.env` file with:
```
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

## 📱 Screen Structure

### Authentication Flow
1. **Splash Screen**: App loading and branding
2. **Login Screen**: User authentication
3. **Sign Up Screen**: New user registration
4. **User Info Screen**: Basic user information collection
5. **BMI Screen**: Health metrics calculation
6. **Selection Screen**: Fitness goals selection
7. **Exercise Level Screen**: Activity level assessment
8. **House Selection Screen**: AI-powered house assignment

### Main App Flow
1. **Dashboard**: Overview of progress, tasks, and metrics
2. **Chat**: AI trainer interaction and guidance

## 🔄 State Management

The app uses a combination of:
- **React Hooks**: Local component state
- **Custom Hooks**: Reusable state logic
- **Firebase**: Real-time data synchronization
- **Route Parameters**: Screen-to-screen data passing

## 🎯 Best Practices Implemented

### Code Organization
- **Separation of Concerns**: UI, logic, and data layers separated
- **Component Reusability**: Generic components with props-based customization
- **Consistent Naming**: Clear, descriptive function and variable names
- **Modular Structure**: Related functionality grouped together

### Performance
- **Memoization**: React.memo and useCallback for expensive operations
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Proper image sizing and caching
- **Efficient Re-renders**: Minimal component updates

### Maintainability
- **Type Safety**: PropTypes and consistent data structures
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Documentation**: Clear comments and README documentation
- **Testing Ready**: Modular components suitable for unit testing

## 🔮 Future Enhancements

- **TypeScript Migration**: Add type safety throughout the app
- **Unit Testing**: Comprehensive test coverage
- **Performance Monitoring**: Analytics and crash reporting
- **Offline Support**: Local data caching and sync
- **Push Notifications**: Reminder and achievement notifications
- **Social Features**: Friend connections and challenges

## 🤝 Contributing

1. Follow the established code structure and naming conventions
2. Use the provided reusable components when possible
3. Add proper error handling and loading states
4. Update documentation for new features
5. Test on both iOS and Android platforms

## 📄 License

This project is proprietary software. All rights reserved.
