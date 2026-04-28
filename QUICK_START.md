# Quick Start Guide - Social Connect App

## Prerequisites

Before you begin, make sure you have:

- **Node.js** v22.11.0 or higher ([Download](https://nodejs.org))
- **npm** or **yarn** package manager
- **React Native CLI** installed globally
- **Git** (optional, for version control)

## Installation Steps

### 1. Install Node Dependencies

Open terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages including React Navigation, Redux, Formik, and Yup.

### 2. Install React Native CLI (if not already installed)

```bash
npm install -g react-native-cli
```

### 3. Start Metro Bundler

In a terminal window, run:

```bash
npm start
```

This starts the Metro Bundler. Keep this running for development.

### 4. Run on Android

**Option A: Using Android Emulator**
```bash
# Make sure Android Emulator is running first, then:
npm run android
```

**Option B: Using Physical Device**
```bash
# Enable USB Debugging on device first, then:
npm run android
```

### 5. Run on iOS

**Option A: Using iOS Simulator**
```bash
npm run ios
```

**Option B: Using Physical Device**
```bash
cd ios
pod install
cd ..
npm run ios
```

## Firebase Configuration (Important!)

The app requires Firebase to work properly. Follow these steps:

### 1. Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "SocialConnect"
4. Click "Create project"

### 2. Get Firebase Credentials

1. In Firebase Console, click your project
2. Go to Project Settings (gear icon)
3. Copy these values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 3. Update Firebase Config File

Edit `src/services/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4. Enable Firebase Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. Click "Enable"

### 5. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode"
4. Choose your region
5. Click "Enable"

### 6. Enable Firebase Storage

1. Go to "Storage"
2. Click "Get started"
3. Use test mode
4. Click "Done"

## Test the App

Once the app runs, you should see the login screen.

### Test Credentials (if using existing users):
- **Email**: test@example.com
- **Password**: password123

### Create New Account:
- Click "Create a new account"
- Fill in the form
- Accept terms and conditions
- Click "Create Account"

## Common Commands

```bash
# Start development
npm start

# Run Android
npm run android

# Run iOS
npm run ios

# Run tests
npm test

# Clear cache
npm start -- --reset-cache

# Lint code
npm run lint
```

## Project Structure

```
Social/
├── src/
│   ├── screens/          - App screens (Login, Home, Profile, etc.)
│   ├── components/       - Reusable UI components
│   ├── navigation/       - Navigation setup
│   ├── redux/           - State management
│   ├── services/        - Firebase & API services
│   └── utils/           - Helper functions and constants
├── android/             - Android native code
├── ios/                 - iOS native code
├── App.jsx              - Main app component
└── package.json         - Dependencies
```

## Features Included

✅ **Authentication** - Login, Signup, Forgot Password  
✅ **Home Feed** - View posts, like, comment, share  
✅ **Create Post** - Text, images, trending topics  
✅ **User Profile** - View posts, edit profile, statistics  
✅ **Comments** - Add and view comments  
✅ **Notifications** - Real-time activity updates  
✅ **Settings** - Privacy, security, app info  

## Troubleshooting

### Problem: Metro Bundler not starting

```bash
npm start -- --reset-cache
```

### Problem: Android build fails

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Problem: iOS dependencies not found

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

### Problem: App keeps showing login screen

Check Firebase configuration in `src/services/firebaseConfig.js`

### Problem: Can't find Android Emulator

1. Open Android Studio
2. Click "AVD Manager"
3. Start an emulator
4. Then run `npm run android`

## Development Tips

1. **Hot Reload**: Shake device/emulator and select "Reload"
2. **Debug Menu**: Shake device/emulator and select "Debug"
3. **Redux DevTools**: Install Redux DevTools Extension
4. **Logs**: View logs with `npm run android -- --verbose`

## Need More Help?

- Check [React Native Documentation](https://reactnative.dev)
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Refer to `SETUP_GUIDE.md` for detailed setup

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Run the app
3. ✅ Test all features
4. ✅ Customize colors and branding
5. ✅ Add your own features

---

**Happy coding! 🚀**
