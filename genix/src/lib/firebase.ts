import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, TwitterAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-BH6X2P4J3Y" // Can keep this value or add it to environment variables
};

// Ensure Firebase is initialized only once
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let analytics: any = null;

if (typeof window !== 'undefined') {
  try {
    // Check if the app is already initialized
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Only initialize analytics in client environment
    if (process.env.NODE_ENV === 'production') {
      // Dynamic import to avoid server-side rendering issues
      import('firebase/analytics').then(({ getAnalytics }) => {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      }).catch(error => {
        console.error('Failed to initialize Firebase Analytics:', error);
      });
    }
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  // Server-side rendering, use minimal initialization
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// Create Twitter provider
const twitterProvider = new TwitterAuthProvider();

// Configure Twitter provider parameters
twitterProvider.setCustomParameters({
  lang: 'en',
  'allow_signup': 'true'
});

export { app, auth, twitterProvider, analytics, db };