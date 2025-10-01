// FIXED: CascadingSelector.js - Shows all selections clearly
// Location: src/components/CascadingSelector.js
// Action: REPLACE with this version

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';

function CascadingSelector({ module, onSelect, selectedPath }) {
  const [selections, setSelections] = useState(selectedPath || []);
  const [dropdownLevels, setDropdownLevels] = useState([]);
  const [selectionBreakdown, setSelectionBreakdown] = useState([]);

  // Build dropdown levels and calculate cumulative prices
  const buildDropdowns = useCallback(() => {
    if (!module || !module.tree) {
      onSelect(null);
      return;
    }

    const tree = module.tree;
    
    if (!tree.children || !Array.isArray(tree.children) || tree.children.length === 0) {
      onSelect(null);
      return;
    }

    const levels = [];
    const breakdown = [];
    let current = tree;
    let cumulativePrice = 0;

    // Root level - ALWAYS SHOW
    levels.push({
      title: current.title || 'Select',
      options: current.children,
      selectedIndex: selections[0] !== undefined ? selections[0] : null,
      path: [],
      isRequired: true
    });

    // Navigate through selections and build breakdown
    for (let i = 0; i < selections.length; i++) {
      const selectedIndex = selections[i];
      
      if (!current.children || !Array.isArray(current.children)) {
        break;
      }

      const selectedChild = current.children[selectedIndex];
      if (selectedChild) {
        current = selectedChild;
        
        // Add to breakdown
        breakdown.push({
          level: levels[i] ? levels[i].title : 'Level',
          name: current.name || 'Unnamed',
          price: current.price || 0
        });
        
        cumulativePrice += (current.price || 0);

        // ALWAYS show next level dropdown if children exist
        if (current.children && Array.isArray(current.children) && current.children.length > 0) {
          levels.push({
            title: current.title || 'Select',
            options: current.children,
            selectedIndex: selections[i + 1] !== undefined ? selections[i + 1] : null,
            path: [...selections.slice(0, i + 1)],
            isRequired: false
          });
        }
      }
    }

    setDropdownLevels(levels);
    setSelectionBreakdown(breakdown);

    if (breakdown.length > 0) {
      onSelect({
        path: selections,
        breakdown: breakdown,
        total: cumulativePrice
      });
    } else {
      onSelect(null);
    }
  }, [module, selections, onSelect]);

  useEffect(() => {
    if (module && module.tree) {
      buildDropdowns();
    }
  }, [module, buildDropdowns]);

  // Handle selection change
  const handleChange = (levelIndex, selectedIndex) => {
    const newSelections = selections.slice(0, levelIndex);
    if (selectedIndex !== '') {
      newSelections.push(parseInt(selectedIndex));
    }
    setSelections(newSelections);
  };

  // Calculate total price
  const getTotalPrice = () => {
    return selectionBreakdown.reduce((sum, item) => sum + item.price, 0);
  };

  // Validation checks
  if (!module) {
    return (
      <div className="text-sm text-red-500">
        Error: Module data is missing
      </div>
    );
  }

  if (!module.tree) {
    return (
      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
        ⚠️ This module needs to be updated with the new tree structure. Please edit this module in Admin panel.
      </div>
    );
  }

  if (!module.tree.children || !Array.isArray(module.tree.children) || module.tree.children.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No items configured for this module. Please add items in Admin panel.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ALL Cascading Dropdowns - ALWAYS VISIBLE */}
      {dropdownLevels.map((level, index) => {
        const isSelected = level.selectedIndex !== null && level.selectedIndex !== undefined;
        const selectedOption = isSelected ? level.options[level.selectedIndex] : null;

        return (
          <div key={index} className={`${isSelected ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'} rounded-lg p-3 transition-all`}>
            {/* Level Header */}
            <div className="flex items-center gap-2 mb-2">
              {isSelected && <CheckCircle className="text-green-600" size={18} />}
              <label className="block text-sm font-semibold text-gray-700">
                {index + 1}. {level.title}
                {!level.isRequired && <span className="text-gray-400 text-xs ml-1">(Optional)</span>}
              </label>
            </div>

            {/* Dropdown */}
            <select
              value={level.selectedIndex !== null ? level.selectedIndex : ''}
              onChange={(e) => handleChange(index, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isSelected 
                  ? 'border-green-300 bg-white font-medium text-gray-900' 
                  : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">
                {isSelected ? '✓ Change selection...' : `-- Select ${level.title} --`}
              </option>
              {level.options && level.options.map((option, optionIndex) => (
                <option key={optionIndex} value={optionIndex}>
                  {option.name || 'Unnamed'} - ${(option.price || 0).toLocaleString()}
                </option>
              ))}
            </select>

            {/* Show selected value clearly */}
            {isSelected && selectedOption && (
              <div className="mt-2 flex justify-between items-center text-sm">
                <span className="text-green-700 font-medium">
                  ✓ Selected: {selectedOption.name}
                </span>
                <span className="text-green-600 font-bold">
                  +${(selectedOption.price || 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Price Breakdown Summary */}
      {selectionBreakdown.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-300 mt-4">
          <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Selection Summary:
          </div>
          
          {/* Individual Items */}
          <div className="space-y-2 mb-3">
            {selectionBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-white rounded px-3 py-2">
                <span className="text-gray-700">
                  <span className="text-gray-500 font-medium">{item.level}:</span> <span className="font-semibold">{item.name}</span>
                </span>
                <span className="font-bold text-gray-800">
                  ${item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
            <span className="text-base font-bold text-gray-800">Module Total:</span>
            <span className="text-3xl font-bold text-green-600">
              ${getTotalPrice().toLocaleString()}
            </span>
          </div>

          {/* Show if more options available */}
          {dropdownLevels.length > selections.length && (
            <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded font-medium">
              💡 You can add more options below or proceed with current selection
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CascadingSelector;