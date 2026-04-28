# Dependencies & Installation Guide

## 📋 Complete Dependencies List

### Core React Native
```json
{
  "react": "^19.2.3",
  "react-native": "^0.85.2"
}
```

### Navigation
```json
{
  "@react-navigation/native": "^7.2.2",
  "@react-navigation/stack": "^7.8.11",
  "@react-navigation/bottom-tabs": "^7.2.0",
  "react-native-gesture-handler": "^2.14.0",
  "react-native-reanimated": "^3.5.1",
  "react-native-screens": "^4.24.0",
  "react-native-safe-area-context": "^5.7.0"
}
```

### State Management
```json
{
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "redux": "^4.2.1"
}
```

### Form & Validation
```json
{
  "formik": "^2.4.5",
  "yup": "^1.3.3"
}
```

### Firebase (Not yet installed - see Firebase setup)
```json
{
  "@react-native-firebase/app": "latest",
  "@react-native-firebase/auth": "latest",
  "@react-native-firebase/firestore": "latest",
  "@react-native-firebase/storage": "latest"
}
```

### Development Tools
```json
{
  "@react-native-community/cli": "latest",
  "@react-native-community/cli-platform-android": "latest",
  "@react-native-community/cli-platform-ios": "latest"
}
```

## 🔧 System Requirements

### Windows/macOS/Linux
- **Node.js**: v22.11.0 or higher
- **npm**: v10.0.0 or higher (comes with Node.js)
- **Git**: Latest version (optional)

### Android Development
- **Android Studio**: Latest version
- **Android SDK**: Version 31+
- **Java Development Kit (JDK)**: Version 11 or 17
- **Gradle**: Included with Android Studio
- **Min API Level**: 21
- **Min SDK**: Android 5.0

### iOS Development
- **Xcode**: Version 15+
- **CocoaPods**: Latest version
- **Ruby**: Version 2.7+
- **Min iOS Version**: 12.4

## 📦 Installation Steps

### Step 1: Prerequisites Installation

#### Windows
```powershell
# Using Chocolatey (if installed)
choco install nodejs

# Or download from https://nodejs.org/
# Download LTS version and install

# Verify installation
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/

# Verify installation
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

### Step 2: Install React Native CLI

```bash
npm install -g react-native-cli
npm install -g @react-native-community/cli
```

### Step 3: Clone or Setup Project

```bash
# If cloning
git clone <repository>
cd Social

# Or create new project
react-native init Social
cd Social
```

### Step 4: Install Project Dependencies

```bash
# Using npm
npm install

# OR using yarn
yarn install
```

This will install:
- React and React Native
- React Navigation (Stack + Tabs)
- Redux Toolkit and React-Redux
- Formik and Yup
- React Native Gesture Handler
- React Native Safe Area Context
- And all other dependencies

### Step 5: Setup Android Development

#### Option A: Using Android Studio GUI

1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio
3. Click "Configure" → "SDK Manager"
4. Install:
   - Android SDK Platform (API 31+)
   - Android SDK Build-Tools (latest)
   - Android Emulator
   - Android SDK Platform-Tools

5. Click "Configure" → "AVD Manager"
6. Click "Create Virtual Device"
7. Select a device and click Next
8. Select Android version (11+) and click Next
9. Name it and click Finish

#### Option B: Using Command Line

```bash
# Set ANDROID_HOME environment variable
# Windows
setx ANDROID_HOME %USERPROFILE%\AppData\Local\Android\Sdk
setx PATH %PATH%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%ANDROID_HOME%\platform-tools

# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
```

### Step 6: Setup iOS Development (macOS only)

```bash
# Install CocoaPods
sudo gem install cocoapods

# Install pods
cd ios
pod install
cd ..
```

### Step 7: Start Development Server

```bash
npm start
```

This starts the Metro Bundler. Keep it running in one terminal.

### Step 8: Run Application

#### Android
```bash
# Terminal 1 (keep running)
npm start

# Terminal 2
npm run android

# Or
react-native run-android
```

#### iOS
```bash
# Terminal 1 (keep running)
npm start

# Terminal 2
npm run ios

# Or
cd ios
pod install
cd ..
react-native run-ios
```

## 🚨 Common Installation Issues & Solutions

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Metro Bundler won't start

**Solution:**
```bash
npm start -- --reset-cache
```

### Issue: Android build fails

**Solution:**
```bash
# Clear Android build cache
cd android
./gradlew clean
cd ..

# Try building again
npm run android
```

### Issue: Android emulator not detected

**Solution:**
```bash
# Start Android emulator manually from Android Studio
# OR via command line
emulator -list-avds  # List available devices
emulator -avd device_name  # Start device
```

### Issue: iOS build fails

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

### Issue: "java.lang.UnsatisfiedLinkError"

**Solution:**
```bash
# Ensure Android NDK is installed in Android Studio
# Update gradle.properties in android/ folder:
# org.gradle.jvmargs=-Xmx2048m
```

### Issue: Module not found error

**Solution:**
```bash
# Ensure all dependencies are installed
npm install

# If specific package missing:
npm install package-name

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

## ✅ Verification Checklist

After installation, verify everything works:

```bash
# Check Node.js version
node --version
# Should be v22.11.0 or higher

# Check npm version
npm --version
# Should be v10.0.0 or higher

# Check React Native installation
react-native --version

# Check project dependencies installed
npm list react react-native react-navigation

# Start app and verify it runs
npm start
```

## 📱 Running on Physical Device

### Android
1. Enable Developer Mode (tap Build Number 7 times in Settings)
2. Enable USB Debugging (in Developer Options)
3. Connect device via USB
4. Authorize computer on device
5. Run: `npm run android`

### iOS
1. Connect device to Mac
2. Open `ios/Social.xcworkspace` in Xcode
3. Select your device in top-left
4. Press Play button to build and run

## 🔄 Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update a specific package
npm install package-name@latest

# Update all packages
npm update

# Major version updates (use carefully)
npm install package-name@next
```

## 📚 Post-Installation Setup

### 1. Firebase Setup
See `FIREBASE_IMPLEMENTATION.md` for detailed Firebase setup.

```bash
# Install Firebase SDK
npm install @react-native-firebase/app \
  @react-native-firebase/auth \
  @react-native-firebase/firestore \
  @react-native-firebase/storage
```

### 2. Environment Configuration
Create `.env` file in project root:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

### 3. Configure IDE
Set up VSCode for React Native development:
- Install "React Native Tools" extension
- Install "ES7+ React/Redux/React-Native snippets"

## 🧹 Cleanup

If you need to completely reset your environment:

```bash
# Remove all node modules
rm -rf node_modules

# Remove lock files
rm -rf package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall everything
npm install

# For Android
cd android
./gradlew clean
cd ..

# For iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

## 📖 Reference Documentation

- [Node.js Download](https://nodejs.org)
- [React Native Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Setup](https://developer.android.com/studio)
- [Xcode Setup](https://developer.apple.com/xcode/)
- [CocoaPods Documentation](https://cocoapods.org)

## 💾 Disk Space Requirements

- **Node.js & npm**: ~500 MB
- **React Native project**: ~1 GB
- **Android SDK**: ~10-15 GB
- **Xcode**: ~15-20 GB (iOS)
- **Total**: ~20-30 GB (recommended SSD)

## ⚡ Performance Tips

1. Use physical device for testing (faster than emulator)
2. Increase Java heap size if build is slow:
   ```
   org.gradle.jvmargs=-Xmx2048m
   ```
3. Enable fast refresh in Metro:
   ```bash
   npm start -- --reset-cache
   ```
4. Use `--verbose` flag for debugging:
   ```bash
   react-native run-android --verbose
   ```

## 🆘 Getting Help

If you encounter issues:

1. Check [React Native Documentation](https://reactnative.dev/docs/getting-started)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
3. Check [GitHub Issues](https://github.com/facebook/react-native/issues)
4. Ask in [React Native Community](https://discord.gg/react)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Complete and tested

