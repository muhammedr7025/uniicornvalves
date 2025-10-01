// FILE #5: REPLACE EXISTING FILE
// Location: src/components/EmployeeDashboard.js
// Action: REPLACE the existing EmployeeDashboard.js with this code

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import CascadingSelector from './CascadingSelector';

function EmployeeDashboard({ customers, modules }) {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [moduleSelections, setModuleSelections] = useState({});
  const [generatedQuote, setGeneratedQuote] = useState(null);

  // Handle module item selection
  const handleModuleSelect = (moduleId, selection) => {
    setModuleSelections(prev => ({
      ...prev,
      [moduleId]: selection
    }));
  };

  // Calculate total price
  const calculateTotal = () => {
    return Object.values(moduleSelections).reduce((sum, selection) => {
      return sum + (selection && selection.item ? selection.item.price : 0);
    }, 0);
  };

  // Check if all required modules are selected
  const areAllModulesSelected = () => {
    for (const module of modules) {
      if (!moduleSelections[module.id] || !moduleSelections[module.id].item) {
        return false;
      }
    }
    return true;
  };

  // Generate the quote
  const generateQuote = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (!areAllModulesSelected()) {
      alert('Please complete selections for all modules');
      return;
    }

    const customer = customers.find(c => c.id === parseInt(selectedCustomer));
    const total = calculateTotal();

    // Build quote items
    const quoteItems = modules.map(module => {
      const selection = moduleSelections[module.id];
      return {
        moduleName: module.name,
        moduleDescription: module.description,
        selectedPath: selection.fullPath,
        price: selection.item.price
      };
    });

    setGeneratedQuote({
      quoteNumber: `QT-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      customer,
      items: quoteItems,
      total
    });
  };

  return (
    <div className="space-y-6">
      {/* Quote Generation Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="text-green-600" />
          Generate Quote
        </h2>

        {/* Customer Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Customer *
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose a customer...</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Module Selections */}
        <div className="space-y-6">
          {modules.map((module, index) => (
            <div key={module.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-3">
                <h3 className="font-semibold text-lg text-gray-800">
                  {index + 1}. {module.name}
                </h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
              
              <CascadingSelector
                module={module}
                onSelect={(selection) => handleModuleSelect(module.id, selection)}
                selectedPath={moduleSelections[module.id]?.path}
              />
            </div>
          ))}
        </div>

        {/* Total Display */}
        {Object.keys(moduleSelections).length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                Total Estimate:
              </span>
              <span className="text-3xl font-bold text-green-600">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>
            {!areAllModulesSelected() && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Complete all module selections to generate quote
              </p>
            )}
          </div>
        )}

        <button
          onClick={generateQuote}
          disabled={!selectedCustomer || !areAllModulesSelected()}
          className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
            selectedCustomer && areAllModulesSelected()
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FileText size={20} />
          Generate Quote
        </button>
      </div>

      {/* Generated Quote Display */}
      {generatedQuote && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Unicorn Valves Estimate
            </h2>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                <p className="font-semibold">
                  Quote Number: {generatedQuote.quoteNumber}
                </p>
                <p className="text-gray-600">Date: {generatedQuote.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{generatedQuote.customer.name}</p>
                <p className="text-gray-600">{generatedQuote.customer.email}</p>
                <p className="text-gray-600">{generatedQuote.customer.phone}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Selection
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {generatedQuote.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{item.moduleName}</div>
                    <div className="text-xs text-gray-500">{item.moduleDescription}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.selectedPath}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    ${item.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="bg-green-50 rounded-lg p-4 min-w-64">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-700">
                  Total Amount:
                </span>
                <span className="text-3xl font-bold text-green-600">
                  ${generatedQuote.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Print Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;