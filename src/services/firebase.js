import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY?.trim(),
  authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.FIREBASE_APP_ID?.trim(),
};

const requiredConfigKeys = Object.keys(firebaseConfig);
export const missingFirebaseConfig = requiredConfigKeys.filter((key) => {
  const value = firebaseConfig[key];
  return !value || value.startsWith('your_');
});

export const isFirebaseConfigured = missingFirebaseConfig.length === 0;
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;

export function requireFirebase() {
  if (!firebaseApp || !db || !auth) {
    throw new Error('Firebase is not configured. Copy .env.example to .env.local, add your Firebase web-app settings, then restart the Node development server.');
  }
  return { app: firebaseApp, db, auth };
}
