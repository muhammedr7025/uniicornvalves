// src/components/SettingsManager.js

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function SettingsManager() {
  const [settings, setSettings] = useState({ currencies: [], customCostTypes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'app_settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'app_settings', 'global'), settings);
      alert('✅ Settings saved successfully!');
    } catch (e) {
      alert('❌ Error saving settings.');
    }
  };

  const handleAddCurrency = () => {
    setSettings({
      ...settings,
      currencies: [...settings.currencies, { code: 'USD', rate: 1.0 }]
    });
  };

  const handleAddCustomType = () => {
    setSettings({
      ...settings,
      customCostTypes: [...settings.customCostTypes, 'New Cost Type']
    });
  };

  const handleCurrencyChange = (index, field, value) => {
    const updated = [...settings.currencies];
    updated[index][field] = field === 'rate' ? parseFloat(value) : value;
    setSettings({ ...settings, currencies: updated });
  };

  const handleCustomTypeChange = (index, value) => {
    const updated = [...settings.customCostTypes];
    updated[index] = value;
    setSettings({ ...settings, customCostTypes: updated });
  };

  const handleDeleteCurrency = (index) => {
    setSettings({ ...settings, currencies: settings.currencies.filter((_, i) => i !== index) });
  };
  
  const handleDeleteCustomType = (index) => {
    setSettings({ ...settings, customCostTypes: settings.customCostTypes.filter((_, i) => i !== index) });
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-gray-600" /> Global Settings
        </h2>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2">
          <Save size={16} /> Save All Settings
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Currency Settings */}
        <div>
          <h3 className="font-bold text-lg mb-2">Currency Conversion (vs INR)</h3>
          <div className="space-y-2">
            {settings.currencies.map((currency, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="text" value={currency.code} onChange={e => handleCurrencyChange(index, 'code', e.target.value)} placeholder="Code (e.g., USD)" className="px-2 py-1 border rounded w-24"/>
                <input type="number" value={currency.rate} onChange={e => handleCurrencyChange(index, 'rate', e.target.value)} placeholder="Rate to INR" className="px-2 py-1 border rounded flex-grow"/>
                <button onClick={() => handleDeleteCurrency(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={handleAddCurrency} className="text-sm text-blue-600 font-medium flex items-center gap-1"><Plus size={14}/> Add Currency</button>
          </div>
        </div>

        {/* Custom Cost Types */}
        <div>
          <h3 className="font-bold text-lg mb-2">Definable Custom Costs</h3>
          <div className="space-y-2">
             {settings.customCostTypes.map((type, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="text" value={type} onChange={e => handleCustomTypeChange(index, e.target.value)} className="px-2 py-1 border rounded flex-grow"/>
                <button onClick={() => handleDeleteCustomType(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={handleAddCustomType} className="text-sm text-blue-600 font-medium flex items-center gap-1"><Plus size={14}/> Add Custom Cost Type</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsManager;