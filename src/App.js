// FILE #6: REPLACE EXISTING FILE
// Location: src/App.js
// Action: REPLACE the existing App.js with this code

import React, { useState } from 'react';
import { FileText, LogOut } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import './App.css';

// Initial mock data with tree structure
const INITIAL_DATA = {
  customers: [
    { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-0100' },
    { id: 2, name: 'TechFlow Industries', email: 'info@techflow.com', phone: '555-0200' }
  ],
  modules: [
    {
      id: 1,
      name: 'Module A - Basic Valves',
      description: 'Standard valve configuration',
      tree: {
        title: 'Valve Type',
        children: [
          {
            id: 'ball-valves',
            name: 'Ball Valves',
            title: 'Size',
            children: [
              { id: 'ball-2', name: '2-inch', price: 500 },
              { id: 'ball-4', name: '4-inch', price: 800 }
            ]
          },
          {
            id: 'gate-valves',
            name: 'Gate Valves',
            title: 'Pressure',
            children: [
              { id: 'gate-std', name: 'Standard', price: 600 },
              { id: 'gate-hp', name: 'High Pressure', price: 1200 }
            ]
          }
        ]
      }
    },
    {
      id: 2,
      name: 'Module B - Advanced Controls',
      description: 'Automated control systems',
      tree: {
        title: 'Control Type',
        children: [
          {
            id: 'manual',
            name: 'Manual Controls',
            title: 'Configuration',
            children: [
              { id: 'manual-basic', name: 'Basic', price: 3000 },
              { id: 'manual-adv', name: 'Advanced', price: 5000 }
            ]
          },
          {
            id: 'auto',
            name: 'Automated Controls',
            title: 'Level',
            children: [
              { id: 'auto-semi', name: 'Semi-Automatic', price: 6000 },
              { id: 'auto-full', name: 'Fully Automatic', price: 10000 }
            ]
          }
        ]
      }
    }
  ]
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [customers, setCustomers] = useState(INITIAL_DATA.customers);
  const [modules, setModules] = useState(INITIAL_DATA.modules);

  // Handle user login
  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  // Handle user logout
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If not logged in, show login screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Main app layout for logged-in users
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Unicorn Valves Estimate
              </h1>
              <p className="text-sm text-gray-600">
                {currentUser.type === 'admin' ? 'Admin Panel' : 'Employee Dashboard'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentUser.type === 'admin' ? (
          <AdminDashboard
            customers={customers}
            setCustomers={setCustomers}
            modules={modules}
            setModules={setModules}
          />
        ) : (
          <EmployeeDashboard
            customers={customers}
            modules={modules}
          />
        )}
      </div>
    </div>
  );
}

export default App;