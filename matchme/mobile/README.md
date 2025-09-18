# MatchMe Mobile App

A React Native mobile application for AI-powered makeup shade recommendations.

## Features

- **AI Skin Tone Analysis**: Take photos or upload images for instant skin tone analysis
- **Manual Input**: Enter skin tone and undertone manually
- **Personalized Recommendations**: Get product recommendations based on your skin profile
- **Product Categories**: Browse recommendations by category (foundation, concealer, powder, blush, lipstick)
- **Favorites**: Save your favorite products
- **User Profile**: Manage your account and preferences

## Screens

- **Home**: Welcome screen and app overview
- **ShadeFinder**: Choose between AI camera analysis or manual input
- **Camera**: Take photos for AI analysis
- **Matches**: View personalized product recommendations
- **Favorites**: Saved products
- **Profile**: User account and settings

## Setup

1. Install dependencies:
   ```bash
   npm install
```

2. For iOS (requires macOS):
   ```bash
   cd ios && pod install && cd ..
   ```

3. Start the Metro bundler:
   ```bash
   npm start
   ```

4. Run on Android:
   ```bash
   npm run android
   ```

5. Run on iOS:
   ```bash
npm run ios
   ```

## Dependencies

- React Navigation for app navigation
- React Native Vector Icons for icons
- React Native Image Picker for camera/gallery access
- Axios for API communication
- AsyncStorage for local data persistence
- React Native Linear Gradient for UI effects

## Backend Integration

The app connects to the MatchMe backend API for:
- User authentication
- Skin tone analysis
- Product recommendations
- User profile management

Make sure the backend server is running on `http://localhost:5000` before testing the app.

## Development

The app is built with TypeScript and follows React Native best practices. The codebase is organized into:

- `src/screens/`: Screen components
- `src/components/`: Reusable UI components
- `src/services/`: API service layer
- `src/contexts/`: React Context for state management
