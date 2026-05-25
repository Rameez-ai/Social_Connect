/**
 * firebase.js
 * -----------
 * Firebase configuration for Social Connect.
 *
 * With @react-native-firebase (v24), Firebase is configured natively:
 *   • Android  → android/app/google-services.json
 *   • iOS      → ios/<YourApp>/GoogleService-Info.plist
 *
 * There is NO JavaScript-side Firebase config object (like the Web SDK).
 * Simply install each @react-native-firebase/* package, place the native
 * config files from the Firebase Console, and import the modules below.
 *
 * @see https://rnfirebase.io/
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// ─── Firestore Settings ────────────────────────────────────────────────────────
// Enable offline persistence (enabled by default on mobile, but explicit is
// clearer). Merge settings so we don't override any internal defaults.
firestore().settings({
  persistence: true, // cache documents for offline access
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// ─── Exports ───────────────────────────────────────────────────────────────────
// Re-export the module accessors so every screen can do:
//   import { auth, firestore, storage, messaging } from '../firebase';

export { auth, firestore, storage, messaging };
