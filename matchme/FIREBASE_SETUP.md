# Firebase Setup Guide for MatchMe

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `matchme-beauty-app`
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## Step 3: Set up Authentication

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

## Step 4: Get Service Account Key

1. Go to Project Settings (gear icon)
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename it to `firebase-service-account.json`
6. Place it in the `backend/` folder

## Step 5: Update Configuration

1. Open `backend/config.env`
2. Replace the placeholder values:
   ```
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   FIREBASE_PROJECT_ID=your-project-id
   JWT_SECRET=your-super-secret-jwt-key
   ```

## Step 6: Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

## Database Structure

Firebase will automatically create these collections:

### Users Collection
```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed_password",
  "profile": {
    "skinTone": "medium",
    "undertone": "warm",
    "skinType": "normal",
    "concerns": ["acne", "aging"],
    "preferences": {
      "coverage": "medium",
      "finish": "natural",
      "brands": ["MAC", "Fenty"]
    }
  },
  "favorites": ["product_id_1", "product_id_2"],
  "matches": ["product_id_3"],
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Products Collection
```json
{
  "id": "product_id",
  "name": "Foundation Name",
  "brand": "Brand Name",
  "category": "foundation",
  "type": "liquid",
  "shades": [
    {
      "name": "Shade Name",
      "hexCode": "#FFD700",
      "undertone": "warm",
      "depth": "medium",
      "intensity": 50
    }
  ],
  "price": 29.99,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Product image"
    }
  ],
  "features": ["long-lasting", "matte"],
  "isActive": true,
  "createdAt": "timestamp"
}
```

## Security Rules

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by all authenticated users
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin can write products
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Service account not found"**
   - Make sure `firebase-service-account.json` is in the backend folder
   - Check that the file has the correct format

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure authentication is properly set up

3. **"Database URL not found"**
   - Verify the database URL in `config.env`
   - Make sure Firestore is enabled in your project

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) 