// Firebase Client SDK configuration for Netlify Functions
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase app singleton
let firebaseApp;
let db;

/**
 * Get Firebase configuration from environment variables
 */
function getFirebaseConfig() {
    return {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
    };
}

/**
 * Initialize Firebase Client SDK
 * Uses public credentials from environment variables
 */
export function initializeFirebase() {
    if (firebaseApp && db) {
        return { app: firebaseApp, db };
    }

    try {
        // Check if already initialized
        const existingApps = getApps();
        if (existingApps.length > 0) {
            firebaseApp = existingApps[0];
        } else {
            const config = getFirebaseConfig();
            firebaseApp = initializeApp(config);
        }

        db = getFirestore(firebaseApp);

        console.log('✅ Firebase initialized successfully');
        return { app: firebaseApp, db };
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        throw new Error('Failed to initialize Firebase: ' + error.message);
    }
}

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
    USERS: 'users',
    POSTS: 'posts',
    NEWSLETTER: 'newsletter',
    CONTACTS: 'contacts'
};

/**
 * Get Firestore database instance
 * @returns {Firestore}
 */
export function getDb() {
    if (!db) {
        const { db: database } = initializeFirebase();
        return database;
    }
    return db;
}
