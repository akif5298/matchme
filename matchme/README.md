# MatchMe - AI-Powered Makeup Shade Recommendation App

A revolutionary mobile beauty app that uses **machine learning** to help users find their perfect makeup shade matches across different brands and products. The app combines computer vision, AI skin tone analysis, and intelligent recommendation algorithms to provide personalized beauty suggestions.

## 🚀 Features

### AI-Powered Analysis
- **Real-time skin tone analysis** using TensorFlow.js and computer vision
- **Undertone detection** (warm, cool, neutral) through color analysis
- **Confidence scoring** for analysis accuracy
- **Camera integration** with instant photo analysis

### Smart Recommendations
- **Personalized product matching** based on skin tone and undertone
- **Multi-category recommendations** (foundation, concealer, powder, blush, lipstick)
- **Shade matching algorithms** with confidence levels
- **Brand-agnostic suggestions** across multiple beauty brands

### User Experience
- **Manual input option** for users who prefer to self-identify
- **Profile management** with skin tone preferences
- **Favorites system** for saving preferred products
- **Modern, intuitive UI** with beautiful gradients and animations

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **TensorFlow.js** for ML model inference
- **Firebase** for authentication and database
- **Jimp** for image processing
- **Multer** for file uploads

### Mobile App
- **React Native** with TypeScript
- **React Navigation** for routing
- **React Native Camera** for photo capture
- **Axios** for API communication
- **React Native Elements** for UI components

### Machine Learning
- **Convolutional Neural Network (CNN)** for skin tone classification
- **Color analysis algorithms** for undertone detection
- **Shade matching rules** based on beauty industry standards
- **Real-time inference** on mobile devices

## 📱 Screenshots

*[Screenshots will be added here]*

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **React Native CLI** or Expo CLI
3. **Android Studio** (for Android development)
4. **Xcode** (for iOS development, Mac only)
5. **Firebase Project** - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd matchme
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install mobile app dependencies:**
   ```bash
   cd ../mobile
   npm install
   ```

4. **Configure Firebase:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Replace `backend/firebase-service-account.json` with your actual service account file
   - Update `backend/config.env` with your Firebase project details

5. **Set up environment variables:**
   ```bash
   # In backend/config.env
   FIREBASE_DATABASE_URL=your_firebase_database_url
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the mobile app:**
   ```bash
   cd mobile
   npx react-native start
   ```

3. **Run on device/simulator:**
   ```bash
   # Android
   npx react-native run-android
   
   # iOS (Mac only)
   npx react-native run-ios
   ```

## 🧠 Machine Learning Features

### Skin Tone Analysis
The app uses a custom CNN model trained to classify skin tones into 6 categories:
- Very Fair
- Fair
- Light
- Medium
- Dark
- Very Dark

### Undertone Detection
Color analysis algorithms determine undertone by analyzing:
- Red vs Blue channel ratios
- Color temperature analysis
- Skin region sampling

### Shade Matching Algorithm
```javascript
// Example shade matching logic
const shadeRules = {
  medium: {
    warm: ['medium_warm', 'tan_warm', 'golden'],
    cool: ['medium_cool', 'tan_cool', 'olive'],
    neutral: ['medium_neutral', 'tan', 'natural']
  }
  // ... more rules
};
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Skin Tone Analysis
- `POST /api/shades/analyze` - Analyze skin tone from image
- `POST /api/shades/manual-input` - Manual skin tone input
- `GET /api/shades/matches` - Get personalized matches
- `GET /api/shades/recommendations` - Get product recommendations
- `GET /api/shades/options` - Get available skin tone options

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `GET /api/products?category=foundation` - Get products by category

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/favorites/:id` - Add to favorites
- `DELETE /api/users/favorites/:id` - Remove from favorites

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Set up Authentication (Email/Password)
4. Download service account key
5. Update environment variables

### ML Model Configuration
The ML model can be customized in `backend/src/services/ml-service.js`:
- Model architecture
- Training data
- Confidence thresholds
- Shade matching rules

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
cd mobile
npm test
```

## 📈 Performance

- **Image analysis**: ~2-3 seconds
- **Recommendation generation**: <1 second
- **App startup time**: <3 seconds
- **Memory usage**: <100MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow.js team for ML capabilities
- React Native community for mobile development tools
- Beauty industry experts for shade matching algorithms

## 📞 Support

For support, email support@matchme.com or create an issue in this repository.

---

**MatchMe** - Find your perfect shade with AI! 💄✨