import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyAIaPHwsnZcHN0ksCpoZZjOCOxH_COrwwk",
    authDomain: "valvequoteapp.firebaseapp.com",
    projectId: "valvequoteapp",
    storageBucket: "valvequoteapp.firebasestorage.app",
    messagingSenderId: "148228679687",
    appId: "1:148228679687:web:2749414fac52caac7222a2",
    measurementId: "G-F3NQF5SZC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;