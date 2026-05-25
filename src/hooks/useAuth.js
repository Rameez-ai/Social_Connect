/**
 * useAuth.js
 * ---------
 * Custom React hook that sets up the Firebase Authentication state listener
 * on mount. When a user is detected, it hydrates the Redux store with their
 * full profile data from Firestore.
 *
 * @module hooks/useAuth
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import userService from '../services/userService';
import { setUser, clearUser, setLoading } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Firebase onAuthStateChanged listener
    const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          dispatch(setLoading(true));
          // Hydrate the Redux store with the user's Firestore profile
          const profile = await userService.getUserProfile(firebaseUser.uid);
          
          if (profile) {
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...profile,
              })
            );
          } else {
            // Profile doc doesn't exist yet (could happen during quick sign-up transition)
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
              })
            );
          }
        } else {
          // No user is signed in
          dispatch(clearUser());
        }
      } catch (error) {
        console.warn('[useAuth] Error fetching user profile on auth change:', error);
        dispatch(clearUser());
      } finally {
        setInitializing(false);
        dispatch(setLoading(false));
      }
    });

    return subscriber; // unsubscribe on unmount
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading: loading || initializing,
  };
};

export default useAuth;
