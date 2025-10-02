// FILE 2: NEW FILE - Authentication Context
// Location: src/context/AuthContext.js
// Action: CREATE NEW FILE

import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up new user
  async function signup(email, password, role, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save user role and info to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      role,
      name,
      createdAt: new Date().toISOString()
    });
    
    return userCredential;
  }

  // Sign in
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign out
  function logout() {
    return signOut(auth);
  }

  // Get user role from Firestore
  async function getUserRole(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}