// src/components/HierarchicalSelector.js

import React, { useState, useEffect } from 'react';

function HierarchicalSelector({ title, structure, data, onSelect }) {
  const [path, setPath] = useState([]);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const buildLevels = () => {
      let currentOptions = data;
      const newLevels = [];
      for (let i = 0; i < structure.length; i++) {
        if (!currentOptions) break;
        newLevels.push({
          label: structure[i],
          options: currentOptions,
          selectedValue: path[i] !== undefined ? path[i] : '',
        });
        const selectedItem = currentOptions.find(item => item.name === path[i]);
        currentOptions = selectedItem ? selectedItem.children : null;
      }
      setLevels(newLevels);
    };
    buildLevels();
  }, [path, data, structure]);
  
  const handleSelect = (levelIndex, value) => {
    const newPath = path.slice(0, levelIndex);
    if (value) newPath.push(value);
    setPath(newPath);

    let finalSelection = null;
    let currentLevel = data;
    if (newPath.length > 0) {
        for (const key of newPath) {
            finalSelection = currentLevel.find(item => item.name === key);
            if (finalSelection) {
                currentLevel = finalSelection.children;
            } else {
                break;
            }
        }
    }
    
    if (finalSelection && (!finalSelection.children || finalSelection.children.length === 0)) {
        onSelect(finalSelection);
    } else {
        onSelect(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-4">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="space-y-3">
        {levels.map((level, index) => (
            <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{level.label}</label>
            <select
                value={level.selectedValue}
                onChange={(e) => handleSelect(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
                <option value="">-- Select {level.label} --</option>
                {level.options.map((option, optIndex) => (
                <option key={optIndex} value={option.name}>
                    {option.name}
                </option>
                ))}
            </select>
            </div>
        ))}
        </div>
    </div>
  );
}

export default HierarchicalSelector;