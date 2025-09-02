import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCg5mRfikXoR7TpHYqxzN9b7BHiJ5RlBo",
  authDomain: "connectnow-e73f2.firebaseapp.com",
  projectId: "connectnow-e73f2",
  storageBucket: "connectnow-e73f2.firebasestorage.app",
  messagingSenderId: "687582167159",
  appId: "1:687582167159:web:c53951b3473f9eaae8c672",
  measurementId: "G-Q8101JF6YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
