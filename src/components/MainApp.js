// src/components/MainApp.js

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, LogOut, Home, Package, FileText as QuoteIcon, AlertTriangle } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import QuoteHistory from './QuoteHistory';

const fetchCollection = async (collectionName) => {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

function MainApp() {
  const { currentUser, userRole, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({ customCostTypes: [] });
  const [pricingData, setPricingData] = useState({
      types: [], body: [], bonnet: [], trim_plug: [], trim_seat: [],
      trim_cage: [], trim_stem: [], studs: [], nuts: [], casket: [],
      painting: [], actuatorDiaphragm: [], actuatorPiston: [], packingStandard: [],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settingsDoc = await getDoc(doc(db, 'app_settings', 'global'));
      if (settingsDoc.exists()) setSettings(settingsDoc.data());

      setCustomers(await fetchCollection('customers'));
      
      const fetchedPricingData = {
          types: await fetchCollection('pricing_types'),
          body: await fetchCollection('pricing_body'),
          bonnet: await fetchCollection('pricing_bonnet'),
          trim_plug: await fetchCollection('pricing_trim_plug'),
          trim_seat: await fetchCollection('pricing_trim_seat'),
          trim_cage: await fetchCollection('pricing_trim_cage'),
          trim_stem: await fetchCollection('pricing_trim_stem'),
          studs: await fetchCollection('pricing_studs'),
          nuts: await fetchCollection('pricing_nuts'),
          casket: await fetchCollection('pricing_casket'),
          painting: await fetchCollection('pricing_painting'),
          actuatorDiaphragm: await fetchCollection('pricing_actuators_diaphragm'),
          actuatorPiston: await fetchCollection('pricing_actuators_piston'),
          packingStandard: await fetchCollection('pricing_packing_standard'),
      };
      setPricingData(fetchedPricingData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from the database. This is likely a Firestore permissions issue.');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    try { await logout(); } catch (error) { console.error('Logout error:', error); }
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

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-10 font-semibold text-gray-600">Loading application data...</div>;
    }
    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                <div className="flex">
                    <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500"/></div>
                    <div className="ml-3">
                        <h3 className="text-lg font-bold text-red-800">Application Error</h3>
                        <p className="text-sm text-red-700 mt-2">{error}</p>
                        <button onClick={loadData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Try Again</button>
                    </div>
                </div>
            </div>
        );
    }
    
    switch(currentView) {
        case 'dashboard': return <Dashboard userRole={userRole} customers={customers} />;
        case 'manage': return userRole === 'admin' ? <AdminDashboard customers={customers} settings={settings} pricingData={pricingData} onDataChange={loadData} /> : null;
        case 'generate': return userRole === 'employee' ? <EmployeeDashboard customers={customers} settings={settings} pricingData={pricingData} /> : null;
        case 'quotes': return <QuoteHistory userRole={userRole} />;
        default: return <Dashboard userRole={userRole} customers={customers} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-indigo-600">Unicorn Valves</span>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <button key={item.id} onClick={() => setCurrentView(item.id)} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${ currentView === item.id ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    <item.icon className="mr-2 h-5 w-5" /> {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">Welcome, {currentUser.email} ({userRole})</span>
              <button onClick={handleLogout} className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200">
                <LogOut className="h-5 w-5 mr-1" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default MainApp;