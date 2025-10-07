// src/components/HierarchicalDataManager.js

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Save, XCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function HierarchicalDataManager({ title, structure, data, collectionName, leafFields = [] }) {
  const [items, setItems] = useState([]);
  const [newItemForms, setNewItemForms] = useState({});

  useEffect(() => {
    setItems(JSON.parse(JSON.stringify(data[0]?.data || [])));
  }, [data]);

  const handleSave = async () => {
    try {
      const docId = data[0]?.id || collectionName;
      await setDoc(doc(db, collectionName, docId), { data: items });
      alert(`✅ ${title} data saved successfully!`);
    } catch (e) {
      alert(`❌ Error saving ${title}.`);
    }
  };

  const handleItemChange = (path, field, value) => {
    let newItems = [...items];
    let currentLevel = { children: newItems };
    path.forEach(p => {
        currentLevel = currentLevel.children.find(item => item.name === p);
    });
    if (currentLevel) currentLevel[field] = value;
    setItems(newItems);
  };

  const handleAddNewItem = (path, newItemName) => {
    if (!newItemName || !newItemName.trim()) return;
    let newItems = [...items];
    let currentLevel = newItems;
    for (const key of path) {
      currentLevel = currentLevel.find(item => item.name === key).children;
    }
    
    const isLeaf = path.length === structure.length - 1;
    const newChild = { name: newItemName };
    if (isLeaf) {
        leafFields.forEach(field => { newChild[field.name] = 0; });
    } else {
        newChild.children = [];
    }
    currentLevel.push(newChild);
    setItems(newItems);
    setNewItemForms({ ...newItemForms, [path.join('.')]: false });
  };

  const handleDeleteItem = (path) => {
    if (!window.confirm(`Delete "${path[path.length - 1]}"?`)) return;
    let newItems = [...items];
    if (path.length === 1) {
      setItems(newItems.filter(item => item.name !== path[0]));
      return;
    }
    let parentLevel = newItems;
    for (let i = 0; i < path.length - 2; i++) {
      parentLevel = parentLevel.find(item => item.name === path[i]).children;
    }
    const parent = parentLevel.find(item => item.name === path[path.length - 2]);
    parent.children = parent.children.filter(item => item.name !== path[path.length - 1]);
    setItems(newItems);
  };
  
  const NewItemForm = ({ path }) => {
    const [name, setName] = useState('');
    return (
      <div className="flex gap-2 mt-2">
        <input type="text" placeholder={`New ${structure[path.length]} Name`} value={name} onChange={e => setName(e.target.value)} className="flex-grow px-2 py-1 border rounded" />
        <button onClick={() => handleAddNewItem(path, name)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Add</button>
        <button onClick={() => setNewItemForms({ ...newItemForms, [path.join('.')]: false })} className="text-gray-500 hover:text-gray-700"><XCircle size={20}/></button>
      </div>
    );
  };

  const renderLevel = (levelItems, path = [], levelIndex = 0) => {
    if (!structure[levelIndex]) return null;
    return (
      <div className="ml-4 pl-4 border-l border-gray-200">
        {levelItems.map((item, index) => (
          <div key={`${path.join('.')}-${index}`} className="mt-2 p-2 bg-gray-50 rounded group">
            <div className="flex items-center gap-2">
              <input type="text" value={item.name} onChange={(e) => handleItemChange([...path, item.name], 'name', e.target.value)} className="font-medium flex-1 text-gray-800 bg-transparent border-b border-transparent focus:border-indigo-500 focus:bg-white outline-none"/>
              {levelIndex === structure.length - 1 && leafFields.map(field => (
                  <React.Fragment key={field.name}>
                    <label className="text-sm">{field.label}:</label>
                    <input type="number" value={item[field.name] || ''} onChange={(e) => handleItemChange([...path, item.name], field.name, parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 border rounded"/>
                  </React.Fragment>
              ))}
              <button onClick={() => handleDeleteItem([...path, item.name])} className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
            </div>
            {item.children && renderLevel(item.children, [...path, item.name], levelIndex + 1)}
          </div>
        ))}
        {newItemForms[path.join('.')] ? <NewItemForm path={path} /> : (
          <button onClick={() => setNewItemForms({ ...newItemForms, [path.join('.')]: true })} className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
            <Plus size={14} /> Add New {structure[levelIndex]}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-green-600" /> {title}
        </h2>
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2">
          <Save size={16} /> Save All Changes
        </button>
      </div>
      {renderLevel(items)}
    </div>
  );
}

export default HierarchicalDataManager;