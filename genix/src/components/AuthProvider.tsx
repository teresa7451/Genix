'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithPopup, TwitterAuthProvider } from 'firebase/auth';
import { auth, twitterProvider } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { doc, getDoc, setDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Maximum free generations allowed
const MAX_FREE_GENERATIONS = 5;

// User data interface
interface UserData {
    uid: string;
    remainingGenerations: number;
    totalGenerations: number;
    lastGeneratedAt: Date | null;
    tokens: number;
    createdAt: Date;
    updatedAt: Date;
}

// Create authentication context with extended features
const AuthContext = createContext<{
    user: User | null;
    loading: boolean;
    signOutUser: () => Promise<void>;
    signInUser: () => Promise<void>;
    remainingGenerations: number;
    updateGenerations: () => Promise<boolean>;
    userData: UserData | null;
    refreshUserData: () => Promise<void>;
    isGenerationAllowed: boolean;
}>({
    user: null,
    loading: true,
    signOutUser: async () => { },
    signInUser: async () => { },
    remainingGenerations: 0,
    updateGenerations: async () => false,
    userData: null,
    refreshUserData: async () => { },
    isGenerationAllowed: false,
});

// Custom hook for use in components
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [remainingGenerations, setRemainingGenerations] = useState(0);
    const [userData, setUserData] = useState<UserData | null>(null);

    // Check if user can generate images
    const isGenerationAllowed = true;

    // Sign in function
    const signInUser = async () => {
        try {
            // Show loading toast
            toast.loading('Signing in...', { id: 'signin' });

            // Clear previous login state
            if (user) {
                await signOut(auth);
            }

            // Sign in with Twitter provider
            const result = await signInWithPopup(auth, twitterProvider);

            // Success handling
            toast.dismiss('signin');
            toast.success('Successfully signed in');

            // Initialize user data if first time user
            if (result.user) {
                await initializeUserData(result.user);
            }
        } catch (error: any) {
            // Error handling
            toast.dismiss('signin');
            console.error('Error signing in:', error);

            // Detailed error message handling
            if (error?.code === 'auth/popup-closed-by-user') {
                // User closed the login window, don't show error
                console.log('User closed the auth popup');
            } else if (error?.code === 'auth/network-request-failed') {
                toast.error('Network error. Please check your connection.');
            } else if (error?.code === 'auth/operation-not-allowed') {
                toast.error('Twitter sign-in is not enabled for this project.');
            } else if (error?.code === 'auth/unauthorized-domain') {
                toast.error('This domain is not authorized for authentication.');
                console.error('Unauthorized domain error. Please add your domain to Firebase console.');
            } else {
                // Other errors
                toast.error(`Failed to sign in: ${error?.message || 'Unknown error'}`);
            }
        }
    };

    // Initialize user data in Firestore
    const initializeUserData = async (user: User) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create new user document with initial values
                const now = new Date();
                const userData: Omit<UserData, 'uid'> = {
                    remainingGenerations: MAX_FREE_GENERATIONS,
                    totalGenerations: 0,
                    lastGeneratedAt: null,
                    tokens: 0,
                    createdAt: now,
                    updatedAt: now
                };

                await setDoc(userRef, userData);
                setRemainingGenerations(MAX_FREE_GENERATIONS);
                setUserData({ uid: user.uid, ...userData });

                console.log('User data initialized with free generations');
            } else {
                // Fetch existing user data
                await refreshUserData();
            }
        } catch (error) {
            console.error('Error initializing user data:', error);
        }
    };

    // Update user generation count
    const updateGenerations = async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const userRef = doc(db, 'users', user.uid);

            await updateDoc(userRef, {
                remainingGenerations: increment(-1),
                totalGenerations: increment(1),
                lastGeneratedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Update local state
            setRemainingGenerations(prev => prev - 1);

            await refreshUserData();
            return true;
        } catch (error) {
            console.error('Error updating generations:', error);
            return true;
        }
    };

    // Refresh user data from Firestore
    const refreshUserData = async () => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                const userData: UserData = {
                    uid: user.uid,
                    remainingGenerations: data.remainingGenerations || 0,
                    totalGenerations: data.totalGenerations || 0,
                    lastGeneratedAt: data.lastGeneratedAt ? new Date(data.lastGeneratedAt.toDate()) : null,
                    tokens: data.tokens || 0,
                    createdAt: new Date(data.createdAt.toDate()),
                    updatedAt: new Date(data.updatedAt.toDate())
                };

                setRemainingGenerations(userData.remainingGenerations);
                setUserData(userData);
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    // Sign out function - using forced method to ensure successful logout
    const signOutUser = async () => {
        try {
            // Clear local storage first
            if (typeof window !== 'undefined') {
                localStorage.removeItem('firebase:authUser:' + auth.app.options.apiKey + ':[DEFAULT]');
                sessionStorage.clear();
            }

            // Execute Firebase sign out
            await signOut(auth);

            // Ensure state is updated
            setUser(null);
            setRemainingGenerations(0);
            setUserData(null);

            // Force page refresh to ensure complete reset
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Listen for authentication state changes
    useEffect(() => {
        // Set up error handling to prevent console errors
        const errorHandler = (event: ErrorEvent) => {
            // Filter out Firebase auth related errors, which are typically caused by normal operations like users closing popups
            if (event.message && event.message.includes('auth/popup-closed-by-user')) {
                event.preventDefault();
                return false;
            }
            return true;
        };

        // Add global error listener
        if (typeof window !== 'undefined') {
            window.addEventListener('error', errorHandler as any);
        }

        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
                // Attempt to load user data
                initializeUserData(authUser);
            } else {
                setUser(null);
                setRemainingGenerations(0);
                setUserData(null);
            }
            setLoading(false);
        });

        // Cleanup function
        return () => {
            unsubscribe();
            if (typeof window !== 'undefined') {
                window.removeEventListener('error', errorHandler as any);
            }
        };
    }, []);

    // Provide authentication state and methods to child components
    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signOutUser,
            signInUser,
            remainingGenerations,
            updateGenerations,
            userData,
            refreshUserData,
            isGenerationAllowed
        }}>
            {children}
        </AuthContext.Provider>
    );
} 