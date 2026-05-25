# Firebase Implementation Guide

This guide shows how to connect the app's placeholder Firebase services to a real Firebase backend.

## Setup Overview

The app uses these Firebase services:
1. **Authentication** - Email/Password login
2. **Firestore** - Database for posts, users, comments
3. **Storage** - Image storage for posts and profiles

## Step-by-Step Implementation

### 1. Install Firebase SDK

```bash
npm install @react-native-firebase/app \
  @react-native-firebase/auth \
  @react-native-firebase/firestore \
  @react-native-firebase/storage
```

For Android, also add to `android/app/build.gradle`:

```gradle
dependencies {
  // ... existing dependencies
  implementation platform('com.google.firebase:firebase-bom:32.0.0')
}
```

### 2. Update Firebase Config

Edit `src/services/firebaseConfig.js`:

```javascript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Your Firebase config from Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "socialconnect-xxx.firebaseapp.com",
  projectId: "socialconnect-xxx",
  storageBucket: "socialconnect-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc123...",
};

export { auth, firestore, storage };
```

### 3. Update Authentication Service

Replace `src/services/authService.js`:

```javascript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const authService = {
  async signUp(email, password, fullName) {
    try {
      // Create authentication user
      const result = await auth().createUserWithEmailAndPassword(email, password);
      
      // Save user profile to Firestore
      await firestore().collection('users').doc(result.user.uid).set({
        uid: result.user.uid,
        displayName: fullName,
        email: email,
        photoURL: '',
        bio: '',
        followers: 0,
        following: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async login(email, password) {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async logout() {
    try {
      await auth().signOut();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    return auth().currentUser;
  },

  async updateProfile(displayName, photoURL) {
    try {
      const user = auth().currentUser;
      await user.updateProfile({
        displayName,
        photoURL,
      });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
```

### 4. Update Post Service

Replace `src/services/postService.js`:

```javascript
import firestore from '@react-native-firebase/firestore';

export const postService = {
  async createPost(postData) {
    try {
      const ref = await firestore().collection('posts').add({
        ...postData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return { id: ref.id, ...postData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getPosts(limit = 20) {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getUserPosts(userId, limit = 20) {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updatePost(postId, updates) {
    try {
      await firestore().collection('posts').doc(postId).update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return updates;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deletePost(postId) {
    try {
      await firestore().collection('posts').doc(postId).delete();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async likePost(postId, userId) {
    try {
      const postRef = firestore().collection('posts').doc(postId);
      await postRef.update({
        likedBy: firestore.FieldValue.arrayUnion(userId),
        likes: firestore.FieldValue.increment(1),
      });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async unlikePost(postId, userId) {
    try {
      const postRef = firestore().collection('posts').doc(postId);
      await postRef.update({
        likedBy: firestore.FieldValue.arrayRemove(userId),
        likes: firestore.FieldValue.increment(-1),
      });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async addComment(postId, comment) {
    try {
      const postRef = firestore().collection('posts').doc(postId);
      const commentData = {
        ...comment,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      
      await postRef.update({
        comments: firestore.FieldValue.arrayUnion(commentData),
      });
      
      return commentData;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getComments(postId) {
    try {
      const doc = await firestore()
        .collection('posts')
        .doc(postId)
        .get();
      
      return doc.data()?.comments || [];
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
```

### 5. Update Storage Service

Replace `src/services/storageService.js`:

```javascript
import storage from '@react-native-firebase/storage';

export const storageService = {
  async uploadImage(imageUri, folder = 'posts') {
    try {
      const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const reference = storage().ref(`${folder}/${filename}`);
      
      await reference.putFile(imageUri);
      const url = await reference.getDownloadURL();
      
      return url;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteImage(imagePath) {
    try {
      const reference = storage().refFromURL(imagePath);
      await reference.delete();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async uploadProfileImage(imageUri) {
    try {
      return await this.uploadImage(imageUri, 'profiles');
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
```

### 6. Update User Service

Replace `src/services/userService.js`:

```javascript
import firestore from '@react-native-firebase/firestore';

export const userService = {
  async getUserProfile(userId) {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      return doc.data();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update(profileData);
      
      return profileData;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getFollowers(userId) {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      return doc.data()?.followers || [];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getFollowing(userId) {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      return doc.data()?.following || [];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async followUser(currentUserId, targetUserId) {
    try {
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);

      // Add to current user's following
      await currentUserRef.update({
        following: firestore.FieldValue.arrayUnion(targetUserId),
      });

      // Add to target user's followers
      await targetUserRef.update({
        followers: firestore.FieldValue.arrayUnion(currentUserId),
      });

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async unfollowUser(currentUserId, targetUserId) {
    try {
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);

      // Remove from current user's following
      await currentUserRef.update({
        following: firestore.FieldValue.arrayRemove(targetUserId),
      });

      // Remove from target user's followers
      await targetUserRef.update({
        followers: firestore.FieldValue.arrayRemove(currentUserId),
      });

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
```

## Firestore Security Rules

Add these rules for development (in Firestore):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if true; // Allow public reading of profiles
    }

    // Allow anyone to read posts, authenticated users to write
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Allow anyone to read comments, authenticated users to add
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Testing

After implementation, test these flows:

1. **Sign Up** - Create new account and check Firestore
2. **Login** - Login and verify user is retrieved
3. **Create Post** - Create post and check it appears in Firestore
4. **Upload Image** - Upload image for post/profile
5. **Like Post** - Like a post and verify likes count updates
6. **Add Comment** - Add comment and verify it's saved
7. **Edit Profile** - Update profile and verify changes in Firestore

## Troubleshooting

**Error: Missing google-services.json**
- Download from Firebase Console → Project Settings
- Place in `android/app/google-services.json`

**Error: Permission denied**
- Check Firestore Security Rules
- Ensure user is authenticated

**Error: App crashes on startup**
- Check Firebase credentials in config
- Ensure Firebase project exists

## Reference

- [Firebase React Native Docs](https://rnfirebase.io/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

Happy coding! 🎉
