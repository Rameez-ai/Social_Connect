# Social Connect

Social Connect is a complete, modern, high-performance mobile social media application inspired by Instagram. It is built using **React Native CLI**, **Firebase**, **Redux Toolkit**, **React Navigation v7**, and **React Native Reanimated**.

The app supports beautiful UI aesthetics, real-time updates for posts and comments, direct chats, user follow/unfollow streams, profile customization, and dark/light appearance switching.

---

## 🚀 Tech Stack & Core Libraries

- **Framework**: React Native CLI (v0.85.x, New Architecture & Hermes engine enabled)
- **State Management**: Redux Toolkit & React Redux
- **Database**: Firebase Cloud Firestore (real-time listeners via `onSnapshot`)
- **Authentication**: Firebase Auth (Email/Password registration & password resets)
- **Storage**: Firebase Cloud Storage (post photos and profile picture uploads)
- **Push Messages**: Firebase Cloud Messaging (FCM tokens & in-app foreground/background notifications)
- **Navigation**: React Navigation v7 (Stack & Bottom Tab Navigators)
- **Forms & Validation**: Formik + Yup
- **Media picking & compression**: `react-native-image-picker` & `@bam.tech/react-native-image-resizer`
- **Fast Image Caching**: `@d11/react-native-fast-image` (performant New Arch-compatible fork)
- **Animations**: `react-native-reanimated` (spring scale heart bursts & slide-up modals)
- **Date Handling**: `dayjs` (relative relative-time formatting)
- **Styling**: Theme Context supporting real-time toggling of **Light & Dark modes**

---

## 📁 Folder Structure

```text
SocialConnect/
├── android/             # Android native platform folder
├── ios/                 # iOS native platform folder
├── firebase.js          # JavaScript Firebase registration/settings
├── App.js               # Global providers wrapping the app root
├── src/
│   ├── assets/          # Shared media resources and images
│   ├── components/      # Reusable styled UI components
│   │   ├── ChatBubble.js
│   │   ├── CommentItem.js
│   │   ├── ConfirmDialog.js
│   │   ├── ConversationItem.js
│   │   ├── CustomTabBar.js
│   │   ├── EmptyState.js
│   │   ├── ImagePreview.js
│   │   ├── LoadingSpinner.js
│   │   ├── PostCard.js
│   │   ├── SkeletonLoader.js
│   │   ├── Toast.js
│   │   └── UserCard.js
│   ├── hooks/           # Custom React hook helpers
│   │   ├── useAuth.js
│   │   ├── useChat.js
│   │   ├── useNotifications.js
│   │   └── usePosts.js
│   ├── navigation/      # Routing stack & tab configurations
│   │   ├── AppStack.js
│   │   ├── AppTabs.js
│   │   ├── AuthStack.js
│   │   └── RootNavigator.js
│   ├── screens/         # Page level view components
│   │   ├── auth/        # Login, SignUp, ForgotPassword
│   │   ├── chat/        # Conversations lists & chat DMs
│   │   ├── home/        # Post feeds, Comments, Post details & editors
│   │   ├── profile/     # User grids, bio cards, updates
│   │   └── settings/    # Display modes & account settings
│   ├── services/        # Modular Firebase read/write managers
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   ├── commentService.js
│   │   ├── notificationService.js
│   │   ├── postService.js
│   │   ├── storageService.js
│   │   └── userService.js
│   ├── store/           # Redux central configuration
│   │   ├── index.js
│   │   └── slices/      # Auth, Posts, Comments, DM Chats, Profiles, Alerts
│   └── utils/           # Shared app constants, schemas & helper utilities
│       ├── constants.js
│       ├── helpers.js
│       ├── theme.js
│       └── validators.js
└── README.md
```

---

## 🛠️ Step-by-Step Installation & Run Guide

### Prerequisites
Make sure your development machine is prepared:
1. **Node.js**: `v20.19.4+` or `v22.11.0+`
2. **Android Development**: Android Studio, JDK 17+, Android SDK (Level 23+)
3. **iOS Development** (macOS only): Xcode 16.2+ & CocoaPods

---

### Step 1: Clone and Install Dependencies
Navigate to your active directory and install packages:
```bash
npm install
```

---

### Step 2: Firebase Integration Guide

#### 1. Create a Firebase Project
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click **Add Project**, name it **SocialConnect**, and select your configurations.

#### 2. Configure Firebase Authentication
- Click **Authentication** in the left sidebar under *Build*.
- Select **Get Started** and enable the **Email/Password** sign-in provider.

#### 3. Setup Cloud Firestore Database
- Select **Firestore Database** and click **Create Database**.
- Set up your database in **Test Mode** (or Production Mode with correct security rules). Choose a cloud database location near you.

#### 4. Configure Cloud Storage
- Select **Storage** and click **Get Started**.
- Initialize rules in test mode to support file upload permissions.

#### 5. Enable Cloud Messaging (Push Notifications)
- Select **Project Settings** (gear icon next to Project Overview) → **Cloud Messaging**.
- The Firebase Cloud Messaging APIs are initialized automatically.

#### 6. Register Platforms & Download Native Configurations

##### **Android Setup (Physical Device / Emulator)**
- Select the **Android icon** on your Project Overview dashboard to add an app.
- **Android package name**: Enter `com.socialconnect`.
- Click **Register App**.
- Download **`google-services.json`**.
- Place the downloaded `google-services.json` file inside:
  `SocialConnect/android/app/`

##### **iOS Setup (Mac OS Users Only)**
- Select **Add App** and click the **iOS icon**.
- Enter your **iOS bundle ID** (e.g. `com.socialconnect`).
- Download **`GoogleService-Info.plist`**.
- Place the downloaded file into your iOS project folder inside Xcode:
  `SocialConnect/ios/`

---

### Step 3: Run the Application

#### Start the Metro Bundler
Keep this terminal window running in the background:
```bash
npm start
```

#### Run on a Connected Android Device or Emulator
1. Connect your physical Android phone with **USB Debugging** enabled, or open an Android Virtual Device (AVD).
2. Verify it is connected using:
   ```bash
   adb devices
   ```
3. Build and launch the application on your device:
   ```bash
   npm run android
   ```

*(Note: iOS builds are launched via `npm run ios` or by building inside Xcode on a Mac).*

---

## 🗃️ Firestore Database Data Model

### `users/{userId}` (User Profiles)
```json
{
  "uid": "USER_ID_STRING",
  "email": "user@example.com",
  "username": "user_name_handle",
  "fullName": "User Full Name",
  "bio": "Life, liberty, and the pursuit of connection.",
  "profilePicture": "https://firebasestorage.googleapis.com/.../profilePicture.jpg",
  "followers": ["user_id_a", "user_id_b"],
  "following": ["user_id_c"],
  "postCount": 12,
  "fcmToken": "FCM_REGISTRATION_TOKEN_STRING",
  "platform": "android",
  "createdAt": "2026-05-25T04:36:11.000Z",
  "updatedAt": "2026-05-25T04:36:11.000Z"
}
```

### `posts/{postId}` (User Feed Posts)
```json
{
  "userId": "AUTHOR_USER_ID",
  "userName": "Author Name",
  "userAvatar": "https://firebasestorage...",
  "text": "Hello world! This is my post caption.",
  "imageUrl": "https://firebasestorage.googleapis.com/.../postImage.jpg",
  "likes": ["user_id_a", "user_id_b"],
  "likeCount": 2,
  "commentCount": 1,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```
#### Subcollection: `posts/{postId}/comments/{commentId}`
```json
{
  "userId": "COMMENTER_USER_ID",
  "userName": "Commenter Name",
  "userAvatar": "https://firebasestorage...",
  "text": "Wow! Stunning photo!",
  "createdAt": "Timestamp"
}
```

### `conversations/{conversationId}` (Direct Chat Threads)
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "lastMessage": "Hey! How's your week?",
  "lastMessageTime": "Timestamp",
  "lastMessageSenderId": "user_id_1",
  "unreadCount": {
    "user_id_1": 0,
    "user_id_2": 1
  },
  "createdAt": "Timestamp"
}
```
#### Subcollection: `conversations/{conversationId}/messages/{messageId}`
```json
{
  "senderId": "SENDER_USER_ID",
  "text": "Hey! How's your week?",
  "read": false,
  "createdAt": "Timestamp"
}
```

### `notifications/{notificationId}` (Activity Feeds)
```json
{
  "recipientId": "RECIPIENT_USER_ID",
  "senderId": "SENDER_USER_ID",
  "senderName": "Sender Name",
  "type": "like", 
  "postId": "OPTIONAL_RELATED_POST_ID",
  "read": false,
  "createdAt": "Timestamp"
}
```

---

## 🎨 Highlights & Premium UX Implementations

- **Seamless Mode Switching**: Toggle Light or Dark appearance instantly from the Settings screen. Custom colors update immediately throughout the layouts, using an efficient context provider that caches selections.
- **Heart-burst Micro-animation**: Tapping post cards triggers an interactive, spring-physic spring-based scale animation (`1.0` ➔ `1.3` ➔ `1.0`) on the custom heart vector icon using high-performance Native UI Thread Reanimated configurations.
- **Performance Optimized FlatLists**: Post feeds, comments, and direct message flows are fully equipped with performance optimizations like `React.memo` components, `useCallback` triggers, `keyExtractor` handles, and dynamic skeleton pulsers to secure buttery-smooth `60 FPS` rendering.
- **Smart Form Validation**: Login, registration, and profile modification forms are backed by yup schema constraints, ensuring real-time inputs match validation standards with interactive UI alerts.
