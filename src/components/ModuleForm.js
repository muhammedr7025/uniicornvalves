// FILE #3: REPLACE EXISTING FILE
// Location: src/components/ModuleForm.js
// Action: REPLACE the existing ModuleForm.js with this code

import React, { useState } from 'react';
import ModuleTreeBuilder from './ModuleTreeBuilder';

function ModuleForm({ module, onClose, onSave }) {
  const [formData, setFormData] = useState(
    module || {
      name: '',
      description: '',
      tree: {
        title: '',
        children: []
      }
    }
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      alert('Please fill module name and description');
      return;
    }

    if (!formData.tree.title || !formData.tree.children || formData.tree.children.length === 0) {
      alert('Please build the module tree structure with at least one item');
      return;
    }

    // Validate that all leaf nodes have prices
    const validation = validateTree(formData.tree);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    // Call the parent's save function
    onSave(formData, module?.id);
    onClose();
  };

  // Validate tree structure
  const validateTree = (node, path = []) => {
    if (!node.children || node.children.length === 0) {
      // Leaf node - must have price
      if (!node.price || node.price <= 0) {
        return {
          valid: false,
          message: `Item "${node.name}" must have a price greater than 0`
        };
      }
    } else {
      // Parent node - must have title and check children
      if (!node.title) {
        return {
          valid: false,
          message: `Category "${node.name || 'unnamed'}" must have a "Next level title"`
        };
      }

      // Validate all children
      for (const child of node.children) {
        const childValidation = validateTree(child, [...path, child.name]);
        if (!childValidation.valid) {
          return childValidation;
        }
      }
    }

    return { valid: true };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl my-8">
        <h3 className="text-2xl font-bold mb-4">
          {module ? 'Edit' : 'Add'} Module
        </h3>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Module A - Basic Valves"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Description of the module"
              />
            </div>
          </div>

          {/* Tree Builder */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-800">
              Module Structure (Tree)
            </h4>
            <ModuleTreeBuilder
              tree={formData.tree}
              onChange={(newTree) => setFormData({ ...formData, tree: newTree })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Save Module
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleForm;