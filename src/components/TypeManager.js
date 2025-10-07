// src/components/TypeManager.js

import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus, Save } from 'lucide-react';
import { collection, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function TypeManager({ data, onDataChange }) {
  const [types, setTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newSeries, setNewSeries] = useState({});

  useEffect(() => {
    setTypes(JSON.parse(JSON.stringify(data || [])));
  }, [data]);

  const handleLocalUpdate = (typeId, seriesIndex, field, value) => {
    setTypes(prevTypes => prevTypes.map(t => {
      if (t.id === typeId) {
        const updatedSeries = t.series.map((s, i) => i === seriesIndex ? { ...s, [field]: value } : s);
        return { ...t, series: updatedSeries };
      }
      return t;
    }));
  };
  
  const handleSaveType = async (type) => {
    try {
      const docRef = doc(db, 'pricing_types', type.id);
      await updateDoc(docRef, { name: type.name, series: type.series });
      alert(`✅ Type "${type.name}" updated successfully!`);
      onDataChange();
    } catch (e) {
      alert('❌ Error updating type.');
    }
  };
  
  const handleAddType = async () => {
      if (!newTypeName.trim()) return;
      try {
          await addDoc(collection(db, 'pricing_types'), { name: newTypeName, series: [] });
          setNewTypeName('');
          alert('✅ New type added!');
          onDataChange();
      } catch (e) {
          alert('❌ Error adding new type.');
      }
  };

  const handleDeleteType = async (typeId) => {
    if (!window.confirm('Are you sure you want to delete this entire type and all its series?')) return;
    try {
      await deleteDoc(doc(db, 'pricing_types', typeId));
      alert('✅ Type deleted!');
      onDataChange();
    } catch (e) {
      alert('❌ Error deleting type.');
    }
  };

  const handleAddSeries = (typeId) => {
    const seriesToAdd = newSeries[typeId];
    if (!seriesToAdd || !seriesToAdd.name || !seriesToAdd.rate) {
      alert('Please enter series name and rate.');
      return;
    }

    setTypes(prevTypes => prevTypes.map(t => {
        if (t.id === typeId) {
            return { ...t, series: [...t.series, { ...seriesToAdd, id: `s${Date.now()}` }] };
        }
        return t;
    }));
    setNewSeries({ ...newSeries, [typeId]: { name: '', rate: '' } });
  };
  
  const handleDeleteSeries = (typeId, seriesId) => {
     setTypes(prevTypes => prevTypes.map(t =>
      t.id === typeId
        ? { ...t, series: t.series.filter(s => s.id !== seriesId) }
        : t
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Tag className="text-purple-600" />
        Step 1: Type Selection (Models & Series)
      </h2>
      <div className="space-y-4">
        {types.map(type => (
          <div key={type.id} className="border border-gray-200 rounded-lg p-4 group">
            <div className="flex justify-between items-center">
                <input 
                  type="text"
                  value={type.name}
                  onChange={(e) => setTypes(types.map(t => t.id === type.id ? {...t, name: e.target.value} : t))}
                  className="font-semibold text-lg text-gray-800 bg-transparent border-b border-transparent focus:border-indigo-500 focus:bg-white outline-none"
                />
                <div className="flex items-center gap-2">
                    <button onClick={() => handleSaveType(type)} className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center gap-1">
                        <Save size={14}/> Save
                    </button>
                    <button onClick={() => handleDeleteType(type.id)} className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <div className="mt-2 space-y-2">
              {type.series.map((s, seriesIndex) => (
                <div key={s.id || seriesIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded gap-2">
                  <input type="text" value={s.name} onChange={e => handleLocalUpdate(type.id, seriesIndex, 'name', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm flex-1" />
                  <input type="number" value={s.rate} onChange={e => handleLocalUpdate(type.id, seriesIndex, 'rate', parseFloat(e.target.value))} className="px-2 py-1 border border-gray-300 rounded text-sm w-24" />
                  <button onClick={() => handleDeleteSeries(type.id, s.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="New Series Name"
                  value={newSeries[type.id]?.name || ''}
                  onChange={(e) => setNewSeries({ ...newSeries, [type.id]: { ...newSeries[type.id], name: e.target.value } })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={newSeries[type.id]?.rate || ''}
                  onChange={(e) => setNewSeries({ ...newSeries, [type.id]: { ...newSeries[type.id], rate: e.target.value } })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                />
                <button onClick={() => handleAddSeries(type.id)} className="bg-purple-100 text-purple-700 px-3 rounded hover:bg-purple-200 transition text-sm font-semibold">
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
         <div className="flex gap-2 mt-4 pt-4 border-t">
              <input 
                type="text"
                placeholder="Add New Type (e.g., GV)"
                value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm flex-1"
              />
              <button onClick={handleAddType} className="bg-green-600 text-white px-4 rounded hover:bg-green-700 transition font-semibold">Add Type</button>
          </div>
      </div>
    </div>
  );
}

export default TypeManager;