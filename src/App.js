// SIMPLE: App.js - Easy to integrate
// Location: src/App.js
// Action: REPLACE existing file

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import MainApp from './components/MainApp';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();

  // Show login screen if not logged in
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Show main app if logged in
  return <MainApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;