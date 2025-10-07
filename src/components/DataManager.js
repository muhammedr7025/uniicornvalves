// src/components/DataManager.js

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Save } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function DataManager({ title, initialData, collectionName, onDataChange }) {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    setItems(initialData || []);
  }, [initialData]);

  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice) return alert('Please enter name and price.');
    try {
        await addDoc(collection(db, collectionName), { name: newItemName, price: parseFloat(newItemPrice) });
        setNewItemName('');
        setNewItemPrice('');
        alert(`✅ New item added to ${title}!`);
        if (onDataChange) onDataChange();
    } catch(e) {
        alert('❌ Error adding item.');
    }
  };
  
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
        await deleteDoc(doc(db, collectionName, itemId));
        alert('✅ Item deleted!');
        if (onDataChange) onDataChange();
    } catch(e) {
        alert('❌ Error deleting item.');
    }
  };
  
  const handleUpdateItem = async (item) => {
      try {
        await updateDoc(doc(db, collectionName, item.id), { name: item.name, price: parseFloat(item.price) });
        alert(`✅ Item "${item.name}" updated!`);
      } catch(e) {
        alert('❌ Error updating item.');
      }
  };
  
  const handleLocalChange = (itemId, field, value) => {
    setItems(items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Layers className="text-blue-600" size={20} />
        {title}
      </h2>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
            <input type="text" value={item.name} onChange={(e) => handleLocalChange(item.id, 'name', e.target.value)} className="col-span-6 px-2 py-1 border rounded" />
            <div className="col-span-6 flex items-center gap-2">
                <span className="text-gray-500">₹</span>
                <input type="number" value={item.price} onChange={(e) => handleLocalChange(item.id, 'price', e.target.value)} className="px-2 py-1 border rounded flex-1"/>
                <button onClick={() => handleUpdateItem(item)} className="text-blue-500 hover:text-blue-700" title="Save this item"><Save size={16}/></button>
                <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700" title="Delete this item"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
         <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t mt-2">
            <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="col-span-6 px-2 py-1 border rounded" placeholder="New Item Name"/>
            <div className="col-span-6 flex items-center gap-2">
               <span className="text-gray-500">₹</span>
               <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="px-2 py-1 border rounded flex-1" placeholder="Price"/>
            </div>
          </div>
           <button onClick={handleAddItem} className="w-full mt-2 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2 text-sm font-semibold">
              <Plus size={16} /> Add Item
            </button>
      </div>
    </div>
  );
}

export default DataManager;