// src/components/CustomerManager.js

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Save } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function CustomerManager({ initialData, onDataChange }) {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '', country: 'India', gst: '', status: 'Active' });

  useEffect(() => {
    setCustomers(initialData || []);
  }, [initialData]);

  const handleLocalChange = (id, field, value) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const handleUpdate = async (customer) => {
    try {
      await updateDoc(doc(db, 'customers', customer.id), customer);
      alert('✅ Customer updated!');
    } catch (e) {
      alert('❌ Error updating customer.');
    }
  };

  const handleAdd = async () => {
    if (!newCustomer.name) return alert('Customer name is required.');
    try {
      await addDoc(collection(db, 'customers'), newCustomer);
      alert('✅ Customer added!');
      setNewCustomer({ name: '', email: '', phone: '', address: '', country: 'India', gst: '', status: 'Active' });
      onDataChange();
    } catch (e) {
      alert('❌ Error adding customer.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteDoc(doc(db, 'customers', id));
      alert('✅ Customer deleted!');
      onDataChange();
    } catch (e) {
      alert('❌ Error deleting customer.');
    }
  };

  const renderCustomerRow = (customer) => (
    <div key={customer.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded hover:bg-gray-50 text-sm">
      <input type="text" value={customer.name} onChange={e => handleLocalChange(customer.id, 'name', e.target.value)} className="col-span-2 px-2 py-1 border rounded" />
      <input type="text" value={customer.address} onChange={e => handleLocalChange(customer.id, 'address', e.target.value)} className="col-span-3 px-2 py-1 border rounded" />
      <input type="email" value={customer.email} onChange={e => handleLocalChange(customer.id, 'email', e.target.value)} className="col-span-2 px-2 py-1 border rounded" />
      <input type="tel" value={customer.phone} onChange={e => handleLocalChange(customer.id, 'phone', e.target.value)} className="col-span-1 px-2 py-1 border rounded" />
      <select value={customer.country} onChange={e => handleLocalChange(customer.id, 'country', e.target.value)} className="col-span-1 px-2 py-1 border rounded bg-white">
        <option>India</option>
        <option>Other</option>
      </select>
      {customer.country === 'India' && (
        <input type="text" value={customer.gst} onChange={e => handleLocalChange(customer.id, 'gst', e.target.value)} className="col-span-1 px-2 py-1 border rounded" placeholder="GST"/>
      )}
      <div className={`col-span-${customer.country === 'India' ? '2' : '3'} flex justify-end gap-2 items-center`}>
          <button onClick={() => handleLocalChange(customer.id, 'status', customer.status === 'Active' ? 'Inactive' : 'Active')} className={`px-2 py-1 text-xs rounded-full ${customer.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {customer.status}
          </button>
          <button onClick={() => handleUpdate(customer)} className="text-blue-500 hover:text-blue-700"><Save size={16}/></button>
          <button onClick={() => handleDelete(customer.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="text-indigo-600" /> Customers
      </h2>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-2 text-xs font-bold text-gray-500">
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Address</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-1">Phone</div>
            <div className="col-span-1">Country</div>
            <div className="col-span-3"></div>
        </div>
        {customers.map(renderCustomerRow)}
        <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t mt-2 text-sm">
          <input type="text" placeholder="New Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="col-span-2 px-2 py-1 border rounded" />
          <input type="text" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="col-span-3 px-2 py-1 border rounded" />
          <input type="email" placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="col-span-2 px-2 py-1 border rounded" />
          <input type="tel" placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="col-span-2 px-2 py-1 border rounded" />
          <select value={newCustomer.country} onChange={e => setNewCustomer({...newCustomer, country: e.target.value})} className="col-span-3 px-2 py-1 border rounded bg-white">
              <option>India</option>
              <option>Other</option>
          </select>
        </div>
        {newCustomer.country === 'India' && (
             <input type="text" placeholder="GST Number" value={newCustomer.gst} onChange={e => setNewCustomer({...newCustomer, gst: e.target.value})} className="w-full px-2 py-1 border rounded text-sm"/>
        )}
        <button onClick={handleAdd} className="w-full mt-2 bg-indigo-100 text-indigo-700 py-2 rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-2 text-sm font-semibold">
          <Plus size={16} /> Add Customer
        </button>
      </div>
    </div>
  );
}

export default CustomerManager;