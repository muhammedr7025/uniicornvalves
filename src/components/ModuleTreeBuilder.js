// UPDATED FILE #1: REPLACE EXISTING
// Location: src/components/ModuleTreeBuilder.js
// Action: REPLACE with this new version (cumulative pricing)

import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

function ModuleTreeBuilder({ tree, onChange }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  // Add child node
  const addChild = (path) => {
    const newTree = JSON.parse(JSON.stringify(tree));
    const parent = getNodeByPath(newTree, path);
    
    if (!parent.children) {
      parent.children = [];
    }
    
    parent.children.push({
      id: `node-${Date.now()}`,
      name: 'New Item',
      price: 0,
      title: ''
    });
    
    onChange(newTree);
  };

  // Update node
  const updateNode = (path, field, value) => {
    const newTree = JSON.parse(JSON.stringify(tree));
    const node = getNodeByPath(newTree, path);
    node[field] = value;
    onChange(newTree);
  };

  // Delete node
  const deleteNode = (path) => {
    if (path.length === 0) return;
    
    const newTree = JSON.parse(JSON.stringify(tree));
    const parentPath = path.slice(0, -1);
    const parent = getNodeByPath(newTree, parentPath);
    const index = path[path.length - 1];
    
    parent.children.splice(index, 1);
    onChange(newTree);
  };

  // Get node by path
  const getNodeByPath = (node, path) => {
    let current = node;
    for (const index of path) {
      current = current.children[index];
    }
    return current;
  };

  // Toggle expand/collapse
  const toggleExpand = (pathKey) => {
    setExpandedNodes(prev => ({
      ...prev,
      [pathKey]: !prev[pathKey]
    }));
  };

  // Render tree node
  const renderNode = (node, path = []) => {
    const pathKey = path.join('-');
    const isExpanded = expandedNodes[pathKey];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={pathKey} className="ml-4">
        <div className="flex items-center gap-2 py-2 border-b border-gray-100">
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(pathKey)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Node Name Input */}
          <input
            type="text"
            value={node.name || ''}
            onChange={(e) => updateNode(path, 'name', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
            placeholder="Item name (e.g., Toyota)"
          />

          {/* Price Input - ALWAYS SHOWN */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={node.price || ''}
              onChange={(e) => updateNode(path, 'price', parseFloat(e.target.value) || 0)}
              className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
              placeholder="Price"
            />
          </div>

          {/* Next Level Title */}
          <input
            type="text"
            value={node.title || ''}
            onChange={(e) => updateNode(path, 'title', e.target.value)}
            className="px-2 py-1 border border-blue-300 rounded text-sm w-32"
            placeholder="Next level title"
          />

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => addChild(path)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Add child option"
            >
              <Plus size={16} />
            </button>
            {path.length > 0 && (
              <button
                onClick={() => deleteNode(path)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {node.children.map((child, index) => renderNode(child, [...path, index]))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">How to build tree with cumulative pricing:</p>
        <ul className="list-disc ml-4 space-y-1 text-gray-700">
          <li><strong>Item name:</strong> Name of option (e.g., "Toyota", "Camry", "Red")</li>
          <li><strong>Price ($):</strong> Price for THIS item (prices add up cumulatively)</li>
          <li><strong>Next level title:</strong> Label for child dropdown (e.g., "Model", "Color")</li>
          <li><strong>➕ Add child:</strong> Add next level options (optional - employee can stop here)</li>
          <li><strong>Example:</strong> Brand ($5,000) + Model ($20,000) + Color ($500) = Total $25,500</li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Root Level Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Root Level Title (First dropdown label)
          </label>
          <input
            type="text"
            value={tree.title || ''}
            onChange={(e) => {
              const newTree = { ...tree, title: e.target.value };
              onChange(newTree);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Brand, Type, Category"
          />
        </div>

        {/* Tree Structure */}
        <div className="border-t border-gray-200 pt-4">
          {!tree.children || tree.children.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No items yet. Click button below to add first item.</p>
            </div>
          ) : (
            tree.children.map((child, index) => renderNode(child, [index]))
          )}
        </div>

        {/* Add Root Child Button */}
        <button
          onClick={() => addChild([])}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Root Item
        </button>
      </div>
    </div>
  );
}

export default ModuleTreeBuilder;