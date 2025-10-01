// VERIFIED FILE: App.js
// Location: src/App.js
// Action: REPLACE with this verified version

import React, { useState } from 'react';
import { FileText, LogOut } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import './App.css';

// Initial mock data with CORRECT tree structure
const INITIAL_DATA = {
  customers: [
    { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-0100' },
    { id: 2, name: 'TechFlow Industries', email: 'info@techflow.com', phone: '555-0200' }
  ],
  modules: [
    {
      id: 1,
      name: 'Module A - Valve Selection',
      description: 'Choose valve type, material, and size',
      tree: {
        title: 'Valve Type',
        children: [
          {
            id: 'ball-valves',
            name: 'Ball Valves',
            price: 500,
            title: 'Material',
            children: [
              {
                id: 'ball-ss',
                name: 'Stainless Steel',
                price: 300,
                title: 'Size',
                children: [
                  { id: 'ball-ss-2', name: '2-inch', price: 200 },
                  { id: 'ball-ss-4', name: '4-inch', price: 400 }
                ]
              },
              {
                id: 'ball-brass',
                name: 'Brass',
                price: 200,
                title: 'Size',
                children: [
                  { id: 'ball-brass-2', name: '2-inch', price: 150 },
                  { id: 'ball-brass-4', name: '4-inch', price: 300 }
                ]
              }
            ]
          },
          {
            id: 'gate-valves',
            name: 'Gate Valves',
            price: 600,
            title: 'Pressure Rating',
            children: [
              { id: 'gate-std', name: 'Standard (150 PSI)', price: 300 },
              { id: 'gate-hp', name: 'High Pressure (300 PSI)', price: 800 }
            ]
          }
        ]
      }
    },
    {
      id: 2,
      name: 'Module B - Control Systems',
      description: 'Select control type and configuration',
      tree: {
        title: 'Control Type',
        children: [
          {
            id: 'manual',
            name: 'Manual Controls',
            price: 1000,
            title: 'Configuration',
            children: [
              { id: 'manual-basic', name: 'Basic Setup', price: 500 },
              { id: 'manual-adv', name: 'Advanced Setup', price: 1500 }
            ]
          },
          {
            id: 'automated',
            name: 'Automated Controls',
            price: 3000,
            title: 'Automation Level',
            children: [
              { id: 'auto-semi', name: 'Semi-Automatic', price: 2000 },
              { id: 'auto-full', name: 'Fully Automatic', price: 4000 }
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

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

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