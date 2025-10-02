// UPDATED: AdminDashboard.js - Saves to Firebase
// Location: src/components/AdminDashboard.js
// Action: REPLACE existing file

import React, { useState } from 'react';
import { Users, Package, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import CustomerForm from './CustomerForm';
import ModuleForm from './ModuleForm';
import CreateEmployee from './CreateEmployee';

function AdminDashboard({ customers, setCustomers, modules, setModules, onDataChange }) {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [saving, setSaving] = useState(false);

  // Save Customer to Firebase
  const handleSaveCustomer = async (formData, customerId) => {
    try {
      setSaving(true);
      
      if (customerId) {
        // Update existing customer
        await updateDoc(doc(db, 'customers', customerId), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        
        setCustomers(customers.map(c => 
          c.id === customerId ? { ...formData, id: customerId } : c
        ));
        
        alert('✅ Customer updated successfully!');
      } else {
        // Add new customer
        const docRef = await addDoc(collection(db, 'customers'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        
        setCustomers([...customers, { ...formData, id: docRef.id }]);
        alert('✅ Customer added successfully!');
      }
      
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('❌ Failed to save customer: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Save Module to Firebase
  const handleSaveModule = async (formData, moduleId) => {
    try {
      setSaving(true);
      
      if (moduleId) {
        // Update existing module
        await updateDoc(doc(db, 'modules', moduleId), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        
        setModules(modules.map(m => 
          m.id === moduleId ? { ...formData, id: moduleId } : m
        ));
        
        alert('✅ Module updated successfully!');
      } else {
        // Add new module
        const docRef = await addDoc(collection(db, 'modules'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        
        setModules([...modules, { ...formData, id: docRef.id }]);
        alert('✅ Module added successfully!');
      }
      
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('❌ Failed to save module: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await deleteDoc(doc(db, 'customers', customerId));
      setCustomers(customers.filter(c => c.id !== customerId));
      alert('✅ Customer deleted successfully!');
      
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('❌ Failed to delete customer: ' + error.message);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    
    try {
      await deleteDoc(doc(db, 'modules', moduleId));
      setModules(modules.filter(m => m.id !== moduleId));
      alert('✅ Module deleted successfully!');
      
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('❌ Failed to delete module: ' + error.message);
    }
  };

  // Count items in tree
  const countItems = (node) => {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, child) => sum + countItems(child), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Employee Button */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Manage Data</h2>
            <p className="text-indigo-100">Manage customers, modules, and employees</p>
          </div>
          <button
            onClick={() => setShowEmployeeForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm font-medium"
          >
            <UserPlus size={20} />
            Create Employee
          </button>
        </div>
      </div>

      {/* Customers Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" />
            Customers ({customers.length})
          </h2>
          <button
            onClick={() => setShowCustomerForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Country</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      {customer.country === 'India' && customer.gstNumber && (
                        <div className="text-xs text-blue-600">GST: {customer.gstNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {customer.address}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {customer.country}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-4">No customers yet</p>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first customer →
            </button>
          </div>
        )}
      </div>

      {/* Modules Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-600" />
            Modules & Pricing ({modules.length})
          </h2>
          <button
            onClick={() => setShowModuleForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Add Module
          </button>
        </div>

        {modules.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const itemCount = module.tree?.children ? 
                module.tree.children.reduce((sum, child) => sum + countItems(child), 0) : 0;

              return (
                <div
                  key={module.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{module.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      📊 {itemCount} items
                    </span>
                    <span className="flex items-center gap-1">
                      🌳 {module.tree?.title || 'Not set'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setEditingModule(module)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-4">No modules yet</p>
            <button
              onClick={() => setShowModuleForm(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first module →
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
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

      {showEmployeeForm && (
        <CreateEmployee
          onClose={() => setShowEmployeeForm(false)}
        />
      )}

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="font-medium">Saving...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;