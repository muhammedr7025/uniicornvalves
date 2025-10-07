// src/components/AdminDashboard.js

import React, { useState } from 'react';
import { UserPlus, Settings } from 'lucide-react';
import CreateEmployee from './CreateEmployee';
import TypeManager from './TypeManager';
import HierarchicalDataManager from './HierarchicalDataManager';
import DataManager from './DataManager';
import CustomerManager from './CustomerManager';

function AdminDashboard({ customers, pricingData, onDataChange }) {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Admin Control Panel</h2>
              <p className="text-indigo-100">Manage all pricing data, customers, and employees</p>
            </div>
            <button onClick={() => setShowEmployeeForm(true)} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium">
              <UserPlus size={20} /> Create Employee
            </button>
        </div>
      </div>
      
      <CustomerManager initialData={customers} onDataChange={onDataChange} />
      <TypeManager initialData={pricingData.types} onDataChange={onDataChange} />
      
      <HierarchicalDataManager title="Body Data" structure={['Size', 'Rating', 'Material', 'End Connect']} leafFields={[{name: 'weight', label: 'Weight'}, {name: 'machining_charge', label: 'MC'}]} data={pricingData.body} collectionName="pricing_body"/>
      <HierarchicalDataManager title="Bonnet Data" structure={['Size', 'Rating', 'Material', 'Type']} leafFields={[{name: 'weight', label: 'Weight'}, {name: 'machining_charge', label: 'MC'}]} data={pricingData.bonnet} collectionName="pricing_bonnet"/>
       
      <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="text-cyan-500" /> Trim Components
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HierarchicalDataManager title="Trim: Plug" structure={['Size', 'Rating']} leafFields={[{name: 'weight', label: 'Weight'}, {name: 'machining_charge', label: 'MC'}]} data={pricingData.trim_plug} collectionName="pricing_trim_plug"/>
              <HierarchicalDataManager title="Trim: Seat" structure={['Size', 'Rating']} leafFields={[{name: 'weight', label: 'Weight'}, {name: 'machining_charge', label: 'MC'}]} data={pricingData.trim_seat} collectionName="pricing_trim_seat"/>
              <HierarchicalDataManager title="Trim: Cage" structure={['Size', 'Rating']} leafFields={[{name: 'weight', label: 'Weight'}, {name: 'machining_charge', label: 'MC'}]} data={pricingData.trim_cage} collectionName="pricing_trim_cage"/>
              <HierarchicalDataManager title="Trim: Stem" structure={['Size', 'Rating']} leafFields={[{name: 'weight', label: 'Weight'}, {name: 'machining_charge', label: 'MC'}]} data={pricingData.trim_stem} collectionName="pricing_trim_stem"/>
          </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="text-orange-500" /> Fittings & Attachments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DataManager title="Studs" initialData={pricingData.studs} collectionName="pricing_studs" />
            <DataManager title="Nuts" initialData={pricingData.nuts} collectionName="pricing_nuts" />
            <DataManager title="Casket" initialData={pricingData.casket} collectionName="pricing_casket" />
            <DataManager title="Packing (Standard)" initialData={pricingData.packingStandard} collectionName="pricing_packing_standard" />
            <DataManager title="Actuator (Diaphragm)" initialData={pricingData.actuatorDiaphragm} collectionName="pricing_actuators_diaphragm" />
            <DataManager title="Actuator (Piston)" initialData={pricingData.actuatorPiston} collectionName="pricing_actuators_piston" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="text-teal-500" /> Finishing
        </h2>
        <HierarchicalDataManager title="Painting" structure={['Size', 'Type of Paint']} leafFields={[{name: 'price', label: 'Price'}]} data={pricingData.painting} collectionName="pricing_painting"/>
      </div>

      {showEmployeeForm && <CreateEmployee onClose={() => setShowEmployeeForm(false)} />}
    </div>
  );
}

export default AdminDashboard;