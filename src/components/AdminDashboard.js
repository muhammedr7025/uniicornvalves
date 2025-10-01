// FILE #4: REPLACE EXISTING FILE
// Location: src/components/AdminDashboard.js
// Action: REPLACE the existing AdminDashboard.js with this code

import React, { useState } from 'react';
import { Users, Package, Plus, Edit2, Trash2 } from 'lucide-react';
import CustomerForm from './CustomerForm';
import ModuleForm from './ModuleForm';

function AdminDashboard({ customers, setCustomers, modules, setModules }) {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingModule, setEditingModule] = useState(null);

  // Handle saving customer (add or update)
  const handleSaveCustomer = (formData, customerId) => {
    if (customerId) {
      // Update existing customer
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...formData, id: customerId } : c
      ));
    } else {
      // Add new customer
      setCustomers([...customers, { ...formData, id: Date.now() }]);
    }
  };

  // Handle saving module (add or update)
  const handleSaveModule = (formData, moduleId) => {
    if (moduleId) {
      // Update existing module
      setModules(modules.map(m => 
        m.id === moduleId ? { ...formData, id: moduleId } : m
      ));
    } else {
      // Add new module
      setModules([...modules, { ...formData, id: Date.now() }]);
    }
  };

  // Delete customer
  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== customerId));
    }
  };

  // Delete module
  const handleDeleteModule = (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  // Count items in tree
  const countItems = (node) => {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, child) => sum + countItems(child), 0);
  };

  return (
    <div className="space-y-6">
      {/* Customers Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" />
            Customers
          </h2>
          <button
            onClick={() => setShowCustomerForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{customer.name}</td>
                  <td className="px-4 py-3 text-sm">{customer.email}</td>
                  <td className="px-4 py-3 text-sm">{customer.phone}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-600" />
            Modules & Pricing
          </h2>
          <button
            onClick={() => setShowModuleForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Module
          </button>
        </div>

        <div className="space-y-4">
          {modules.map((module) => {
            const itemCount = module.tree?.children ? 
              module.tree.children.reduce((sum, child) => sum + countItems(child), 0) : 0;

            return (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{module.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📊 {itemCount} items configured</span>
                      <span>🌳 Root: {module.tree?.title || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingModule(module)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Form Modals */}
      {showCustomerForm && (
        <CustomerForm
          onClose={() => setShowCustomerForm(false)}
          onSave={handleSaveCustomer}
        />
      )}
      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleSaveCustomer}
        />
      )}

      {/* Module Form Modals */}
      {showModuleForm && (
        <ModuleForm
          onClose={() => setShowModuleForm(false)}
          onSave={handleSaveModule}
        />
      )}
      {editingModule && (
        <ModuleForm
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onSave={handleSaveModule}
        />
      )}
    </div>
  );
}

export default AdminDashboard;