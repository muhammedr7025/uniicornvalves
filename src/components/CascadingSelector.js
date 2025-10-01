// FILE #2: NEW FILE
// Location: src/components/CascadingSelector.js
// Action: CREATE THIS FILE

import React, { useState, useEffect } from 'react';

function CascadingSelector({ module, onSelect, selectedPath }) {
  const [selections, setSelections] = useState(selectedPath || []);
  const [currentNode, setCurrentNode] = useState(null);
  const [dropdownLevels, setDropdownLevels] = useState([]);

  useEffect(() => {
    if (module && module.tree) {
      buildDropdowns();
    }
  }, [module, selections]);

  // Build dropdown levels based on current selections
  const buildDropdowns = () => {
    const levels = [];
    let current = module.tree;
    let path = [];

    // Root level
    if (current.children && current.children.length > 0) {
      levels.push({
        title: current.title || 'Select',
        options: current.children,
        selectedIndex: selections[0] !== undefined ? selections[0] : null,
        path: []
      });

      // Navigate through selections
      for (let i = 0; i < selections.length; i++) {
        const selectedIndex = selections[i];
        if (current.children && current.children[selectedIndex]) {
          current = current.children[selectedIndex];
          path.push(selectedIndex);

          // If current node has children, show next level
          if (current.children && current.children.length > 0) {
            levels.push({
              title: current.title || 'Select',
              options: current.children,
              selectedIndex: selections[i + 1] !== undefined ? selections[i + 1] : null,
              path: [...path]
            });
          }
        }
      }
    }

    setDropdownLevels(levels);
    setCurrentNode(current);

    // Notify parent of selection
    if (current && isLeaf(current)) {
      onSelect({
        path: selections,
        item: current,
        fullPath: buildFullPath()
      });
    } else {
      onSelect(null); // Selection incomplete
    }
  };

  // Check if node is leaf
  const isLeaf = (node) => {
    return (!node.children || node.children.length === 0) && 
           node.price !== undefined && 
           node.price !== null && 
           node.price !== '';
  };

  // Build full path string
  const buildFullPath = () => {
    const parts = [];
    let current = module.tree;

    for (const index of selections) {
      if (current.children && current.children[index]) {
        current = current.children[index];
        parts.push(current.name);
      }
    }

    return parts.join(' → ');
  };

  // Handle selection change
  const handleChange = (levelIndex, selectedIndex) => {
    // Update selections up to this level
    const newSelections = selections.slice(0, levelIndex);
    if (selectedIndex !== '') {
      newSelections.push(parseInt(selectedIndex));
    }
    setSelections(newSelections);
  };

  // Get final price
  const getFinalPrice = () => {
    if (currentNode && isLeaf(currentNode)) {
      return currentNode.price;
    }
    return null;
  };

  if (!module || !module.tree || !module.tree.children || module.tree.children.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No items configured for this module
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cascading Dropdowns */}
      {dropdownLevels.map((level, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {level.title}
          </label>
          <select
            value={level.selectedIndex !== null ? level.selectedIndex : ''}
            onChange={(e) => handleChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">-- Select {level.title} --</option>
            {level.options.map((option, optionIndex) => (
              <option key={optionIndex} value={optionIndex}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Selection Path & Price Display */}
      {selections.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Selected Path:</div>
          <div className="font-medium text-gray-800 mb-2">
            {buildFullPath()}
          </div>
          
          {getFinalPrice() !== null ? (
            <div className="flex items-center justify-between pt-2 border-t border-gray-300">
              <span className="text-sm font-medium text-gray-700">Price:</span>
              <span className="text-2xl font-bold text-green-600">
                ${getFinalPrice().toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="text-sm text-amber-600 pt-2 border-t border-gray-300">
              ⚠️ Please complete all selections to see price
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CascadingSelector;