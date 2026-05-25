# Social Connect App - Complete Setup Guide

A production-level React Native social media application featuring authentication, posts, comments, notifications, and user profiles.

## Project Overview

**App Name**: Social Connect  
**Version**: 1.0.0  
**Target**: iOS & Android  
**Framework**: React Native CLI  
**State Management**: Redux Toolkit  
**Backend**: Firebase  
**Form Validation**: Formik + Yup  
**Navigation**: React Navigation (Stack + Bottom Tabs)

## Features Implemented

✅ **Authentication System**
- Login with email/password
- Signup with validation
- Forgot password functionality
- Session management with Redux

✅ **Home Feed**
- Display posts in FlatList
- Like, comment, and share posts
- Pull-to-refresh functionality
- Floating action button for creating posts

✅ **Create Post**
- Text input for post content
- Image upload capability
- Character counter (500 max)
- Trending topics display
- Privacy selector (Public/Private)

✅ **User Profile**
- Display user information (name, bio, followers, posts count)
- View posts in grid or list view
- Edit profile functionality
- Account statistics

✅ **Comments System**
- View comments on posts
- Add new comments
- Like comments
- Display comment timeline

✅ **Notifications**
- Like notifications
- Comment notifications
- Follow notifications
- Mention notifications

✅ **Navigation**
- Stack Navigator for authentication flow
- Bottom Tab Navigator for main app
- Proper back navigation

✅ **Settings**
- Profile settings
- Security settings
- Privacy controls
- App version info
- Logout functionality

## Project Structure

```
Social/
├── android/                          # Android native files
├── ios/                             # iOS native files
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── CustomButton.jsx
│   │   ├── CustomInput.jsx
│   │   ├── Card.jsx
│   │   ├── PostItem.jsx
│   │   ├── UserAvatar.jsx
│   │   ├── Header.jsx
│   │   ├── Checkbox.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── ErrorScreen.jsx
│   │   └── index.js
│   │
│   ├── screens/                     # App screens
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── CreatePost.jsx
│   │   ├── Profile.jsx
│   │   ├── Comments.jsx
│   │   ├── Notifications.jsx
│   │   ├── Settings.jsx
│   │   └── EditProfile.jsx
│   │
│   ├── navigation/                  # Navigation setup
│   │   └── RootNavigator.jsx
│   │
│   ├── redux/                       # Redux store
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── postSlice.js
│   │       └── userSlice.js
│   │
│   ├── services/                    # Firebase & API services
│   │   ├── firebaseConfig.js
│   │   ├── authService.js
│   │   ├── postService.js
│   │   ├── storageService.js
│   │   └── userService.js
│   │
│   └── utils/                       # Utilities and constants
│       ├── colors.js
│       ├── helpers.js
│       ├── validation.js
│       └── constants.js
│
├── App.jsx                          # Main app component
├── index.js                         # Entry point
├── package.json                     # Dependencies
└── README.md                        # This file
```

## Installation & Setup

### Prerequisites

- Node.js 22.11.0 or higher
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Step 1: Install Dependencies

```bash
cd Social
npm install
```

### Step 2: Install Missing Dependencies for Navigation

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-navigation/bottom-tabs
```

### Step 3: Link Native Modules (if needed)

```bash
npx react-native link
```

### Step 4: Configure Firebase

See **Firebase Setup Guide** below.

## Firebase Setup Guide

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `SocialConnect`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Add Android App to Firebase

1. In Firebase Console, click "Add app" → "Android"
2. Register app:
   - **Package name**: `com.example.socialconnect` (or your package name)
   - Click "Register app"
3. Download `google-services.json` file
4. Place it in: `Social/android/app/google-services.json`

### Step 3: Add iOS App to Firebase

1. In Firebase Console, click "Add app" → "iOS"
2. Register app:
   - **Bundle ID**: `com.example.socialconnect` (or your bundle ID)
   - Click "Register app"
3. Download `GoogleService-Info.plist` file
4. Place it in: `Social/ios/Social/GoogleService-Info.plist`
5. Add to Xcode project

### Step 4: Update Firebase Config

In `src/services/firebaseConfig.js`, replace the placeholders with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Step 5: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. Click "Enable"

### Step 6: Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose your region
5. Click "Enable"

### Step 7: Setup Firestore Collections

Create these collections in Firestore:

**1. users** (Collection)
```
Document ID: uid
Fields:
- displayName: string
- email: string
- photoURL: string
- bio: string
- followers: number (default: 0)
- following: number (default: 0)
- createdAt: timestamp
```

**2. posts** (Collection)
```
Document ID: auto-generated
Fields:
- userId: string
- userName: string
- userAvatar: string
- text: string
- image: string (optional)
- likes: number (default: 0)
- likedBy: array
- comments: array
- privacy: string (Public/Private)
- createdAt: timestamp
- updatedAt: timestamp
```

**3. comments** (Collection)
```
Document ID: auto-generated
Fields:
- postId: string
- userId: string
- author: string
- text: string
- likes: number (default: 0)
- createdAt: timestamp
```

### Step 8: Enable Firebase Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Start in test mode
4. Choose your region
5. Click "Done"

## Running the Application

### Android

```bash
# Terminal 1: Start Metro Bundler
npm start

# Terminal 2: Run Android
npm run android
```

Or directly:
```bash
react-native run-android
```

### iOS

```bash
# Terminal 1: Start Metro Bundler
npm start

# Terminal 2: Run iOS
npm run ios
```

Or directly:
```bash
cd ios
pod install
cd ..
react-native run-ios
```

## Available Scripts

```bash
# Start Metro Bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

## Key Dependencies

```json
{
  "@react-navigation/native": "^7.2.2",
  "@react-navigation/stack": "^7.8.11",
  "@react-navigation/bottom-tabs": "^7.2.0",
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "formik": "^2.4.5",
  "yup": "^1.3.3",
  "react-native-gesture-handler": "^2.14.0",
  "react-native-reanimated": "^3.5.1",
  "react-native-screens": "^4.24.0",
  "react-native-safe-area-context": "^5.7.0"
}
```

## Implementing Firebase Services

The app is set up with placeholder Firebase services. To implement real Firebase integration:

### 1. Install Firebase SDK

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```

### 2. Update Authentication Service

In `src/services/authService.js`:

```javascript
import auth from '@react-native-firebase/auth';

export const authService = {
  async signUp(email, password, fullName) {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: fullName });
    return result.user;
  },

  async login(email, password) {
    const result = await auth().signInWithEmailAndPassword(email, password);
    return result.user;
  },

  async logout() {
    await auth().signOut();
  },

  async resetPassword(email) {
    await auth().sendPasswordResetEmail(email);
  },

  async getCurrentUser() {
    return auth().currentUser;
  },
};
```

### 3. Update Post Service

In `src/services/postService.js`:

```javascript
import firestore from '@react-native-firebase/firestore';

export const postService = {
  async createPost(postData) {
    const ref = await firestore().collection('posts').add(postData);
    return { id: ref.id, ...postData };
  },

  async getPosts(limit = 20) {
    const snapshot = await firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // ... more methods
};
```

### 4. Update Storage Service

In `src/services/storageService.js`:

```javascript
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob';

export const storageService = {
  async uploadImage(imageUri, folder = 'posts') {
    const filename = imageUri.split('/').pop();
    const task = storage().ref(`${folder}/${filename}`).putFile(imageUri);
    await task;
    const url = await storage().ref(`${folder}/${filename}`).getDownloadURL();
    return url;
  },

  // ... more methods
};
```

## Color Palette

Primary Colors:
- **Primary Blue**: `#3A4CFF`
- **Secondary Blue**: `#6B7FFF`
- **Accent**: `#5B6FFF`

Neutral Colors:
- **Background**: `#F5F6FF`
- **Surface**: `#FFFFFF`
- **Text Dark**: `#1A1A2E`
- **Text Secondary**: `#7A7A8E`
- **Text Tertiary**: `#A9A9B8`
- **Border**: `#E4E4E9`

Status Colors:
- **Error**: `#FF6B6B`
- **Success**: `#4CAF50`
- **Warning**: `#FFC107`

## Form Validation

All forms use Yup + Formik:

- **Login**: Email & Password validation
- **Signup**: Email, Password matching, Terms acceptance
- **Create Post**: Text required, max 500 characters
- **Edit Profile**: Name required, Bio max 200 characters

## Redux Store Structure

```javascript
{
  auth: {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  posts: {
    posts: [],
    isLoading: false,
    error: null,
    currentPost: null,
  },
  user: {
    profileData: null,
    followers: [],
    following: [],
    isLoading: false,
    error: null,
  },
}
```

## Best Practices Implemented

✅ **Clean Architecture**: Separation of concerns (components, services, redux, navigation)  
✅ **Reusable Components**: All UI components are modular and reusable  
✅ **Form Validation**: Formik + Yup for robust form handling  
✅ **Error Handling**: Try-catch blocks and user-friendly error messages  
✅ **Loading States**: Loading spinners and disabled buttons during API calls  
✅ **Type Safety**: Ready for TypeScript conversion  
✅ **Performance**: FlatList for efficient rendering, Redux for state management  
✅ **Styling**: Consistent color palette and spacing system  
✅ **Navigation**: Proper stack and tab navigation with state management  

## Troubleshooting

### Common Issues

**Issue**: Metro bundler not starting  
**Solution**: Clear cache with `npm start -- --reset-cache`

**Issue**: Android build failing  
**Solution**: 
```bash
cd android
./gradlew clean
cd ..
react-native run-android
```

**Issue**: iOS pods not installing  
**Solution**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
react-native run-ios
```

**Issue**: Firebase credentials not found  
**Solution**: Ensure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are in correct locations

## Next Steps

1. Integrate real Firebase services
2. Add image picker for profile and post images
3. Implement real-time notifications with Firebase Cloud Messaging
4. Add user search functionality
5. Implement follow/unfollow system
6. Add post editing and deletion
7. Implement hashtag system
8. Add direct messaging
9. Implement story feature
10. Add dark mode theme

## Support & Resources

- [React Native Docs](https://reactnative.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation Docs](https://reactnavigation.org)
- [Redux Toolkit Docs](https://redux-toolkit.js.org)

## License

MIT

## Author

Social Connect Development Team

---

**For questions or issues, please refer to the documentation or create an issue in the repository.**
