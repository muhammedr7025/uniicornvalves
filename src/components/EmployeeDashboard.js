// UPDATED FILE #3: REPLACE EXISTING
// Location: src/components/EmployeeDashboard.js
// Action: REPLACE with this new version (cumulative pricing)

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

  // Calculate total price across all modules
  const calculateGrandTotal = () => {
    return Object.values(moduleSelections).reduce((sum, selection) => {
      return sum + (selection ? selection.total : 0);
    }, 0);
  };

  // Check if at least one module is selected
  const hasAnySelection = () => {
    return Object.values(moduleSelections).some(selection => selection !== null);
  };

  // Generate the quote
  const generateQuote = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (!hasAnySelection()) {
      alert('Please select at least one option from any module');
      return;
    }

    const customer = customers.find(c => c.id === parseInt(selectedCustomer));
    const total = calculateGrandTotal();

    // Build quote items - only include modules with selections
    const quoteItems = modules
      .filter(module => moduleSelections[module.id])
      .map(module => {
        const selection = moduleSelections[module.id];
        return {
          moduleName: module.name,
          moduleDescription: module.description,
          breakdown: selection.breakdown,
          moduleTotal: selection.total
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

        {/* Grand Total Display */}
        {hasAnySelection() && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                Grand Total:
              </span>
              <span className="text-3xl font-bold text-green-600">
                ${calculateGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={generateQuote}
          disabled={!selectedCustomer || !hasAnySelection()}
          className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
            selectedCustomer && hasAnySelection()
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

          {/* Quote Items with Breakdown */}
          <div className="space-y-6 mb-6">
            {generatedQuote.items.map((item, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{item.moduleName}</h3>
                  <p className="text-sm text-gray-600">{item.moduleDescription}</p>
                </div>

                {/* Breakdown Table */}
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                        Level
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                        Selection
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {item.breakdown.map((breakdown, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {breakdown.level}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-800">
                          {breakdown.name}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-semibold">
                          ${breakdown.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-3 py-2 text-sm font-bold text-gray-700">
                        Module Subtotal
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-bold text-green-600">
                        ${item.moduleTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="flex justify-end">
            <div className="bg-green-50 rounded-lg p-4 min-w-80">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-700">
                  Grand Total:
                </span>
                <span className="text-4xl font-bold text-green-600">
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