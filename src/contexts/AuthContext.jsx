import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase Configuration (Client)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Listen for Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    email: firebaseUser.email,
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL
                });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google Sign-In successful:', result.user.email);
            return { success: true };
        } catch (error) {
            console.error('Google Sign-In error:', error);
            // Handle specific errors
            if (error.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Popup cerrado por el usuario' };
            }
            if (error.code === 'auth/popup-blocked') {
                return { success: false, error: 'Popup bloqueado. Permite popups para este sitio.' };
            }
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        loginWithGoogle,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
