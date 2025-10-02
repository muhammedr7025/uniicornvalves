// FIXED: MainApp.js - No Warnings
// Location: src/components/MainApp.js
// Action: CREATE NEW FILE

import React, { useState, useEffect } from 'react';
import { FileText, LogOut, Home, Package, FileText as QuoteIcon } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import QuoteHistory from './QuoteHistory';

function MainApp() {
  const { currentUser, userRole, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load customers
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load modules
      const modulesSnapshot = await getDocs(collection(db, 'modules'));
      setModules(modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = userRole === 'admin' ? [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'manage', name: 'Manage Data', icon: Package },
    { id: 'quotes', name: 'Quote History', icon: QuoteIcon }
  ] : [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'generate', name: 'Generate Quote', icon: FileText },
    { id: 'quotes', name: 'My Quotes', icon: QuoteIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Unicorn Valves
                </h1>
                <p className="text-xs text-gray-500">{userRole === 'admin' ? 'Admin Panel' : 'Employee Portal'}</p>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{currentUser.email}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 border-t border-gray-100 pt-4">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === item.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <Dashboard 
            userRole={userRole} 
            customers={customers}
            modules={modules}
          />
        )}
        
        {userRole === 'admin' && currentView === 'manage' && (
          <AdminDashboard
            customers={customers}
            setCustomers={setCustomers}
            modules={modules}
            setModules={setModules}
            onDataChange={loadData}
          />
        )}
        
        {userRole === 'employee' && currentView === 'generate' && (
          <EmployeeDashboard
            customers={customers}
            modules={modules}
          />
        )}
        
        {currentView === 'quotes' && <QuoteHistory userRole={userRole} />}
      </main>
    </div>
  );
}

export default MainApp;