// src/components/EmployeeDashboard.js

import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Save } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import QuoteStep from './QuoteStep';
import HierarchicalSelector from './HierarchicalSelector';
import { generatePDF } from '../utils/pdfGenerator';

const USD_TO_INR_RATE = 88.73; 

const CUSTOM_COST_FIELDS = [
  "Electrical Actuator", "Manual - Hand Wheel", "Manual - Gear Hand Wheel",
  "Testing", "Custom Packing", "Banking Charges", "Profit"
];

function EmployeeDashboard({ customers, pricingData }) {
  const { currentUser } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  
  const [selections, setSelections] = useState(() => {
    const initialCustomCosts = {};
    CUSTOM_COST_FIELDS.forEach(field => { initialCustomCosts[field] = { price: 0, notes: '' }; });
    return {
      type: null, series: null, body: null, bonnet: null, 
      trim_plug: null, trim_seat: null, trim_cage: null, trim_stem: null,
      studs: null, nuts: null, casket: null, packing: null, painting: null,
      actuatorDiaphragm: null, actuatorPiston: null,
      customCosts: initialCustomCosts
    };
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const calculateTotal = React.useCallback(() => {
    let totalInr = 0;
    const { series, body, bonnet, trim_plug, trim_seat, trim_cage, trim_stem, studs, nuts, casket, packing, painting, actuatorDiaphragm, actuatorPiston, customCosts } = selections;
    
    if (series) {
        const totalWeight = (parseFloat(body?.weight) || 0) + (parseFloat(bonnet?.weight) || 0) + (parseFloat(trim_plug?.weight) || 0) + (parseFloat(trim_seat?.weight) || 0) + (parseFloat(trim_cage?.weight) || 0) + (parseFloat(trim_stem?.weight) || 0);
        const totalMachining = (parseFloat(body?.machining_charge) || 0) + (parseFloat(bonnet?.machining_charge) || 0) + (parseFloat(trim_plug?.machining_charge) || 0) + (parseFloat(trim_seat?.machining_charge) || 0) + (parseFloat(trim_cage?.machining_charge) || 0) + (parseFloat(trim_stem?.machining_charge) || 0);
        const castingPrice = totalWeight * (parseFloat(series.rate) || 0);
        totalInr += castingPrice + totalMachining;
    }

    const items = [studs, nuts, casket, packing, painting, actuatorDiaphragm, actuatorPiston];
    items.forEach(item => { if(item) totalInr += parseFloat(item.price) || 0; });
    
    if (customCosts) {
      Object.values(customCosts).forEach(cost => { totalInr += parseFloat(cost.price) || 0; });
    }
    
    setTotalPrice(selectedCurrency === 'USD' ? totalInr / USD_TO_INR_RATE : totalInr);
  }, [selections, selectedCurrency]);

  useEffect(() => { calculateTotal(); }, [selections, selectedCurrency, calculateTotal]);
  
  const handleSelectChange = (step, value, dataList) => {
    let selectedItem = (step === 'series') ? selections.type?.series?.find(s => s.id === value) || null : dataList?.find(item => item.id === value) || null;
    setSelections(prev => ({ ...prev, [step]: selectedItem, ...(step === 'type' && { series: null }) }));
  };
  
  const handleCustomCostChange = (field, subfield, value) => {
    setSelections(prev => ({ ...prev, customCosts: { ...prev.customCosts, [field]: { ...prev.customCosts[field], [subfield]: value } } }));
  };

  const generateQuote = async () => {
    if (!selectedCustomer) return alert('Please select a customer.');
    setIsSaving(true);
    
    const customer = customers.find(c => c.id === selectedCustomer);
    const quoteData = {
        quoteNumber: `QT-${Date.now()}`,
        date: new Date().toLocaleDateString('en-IN'),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.email,
        customerName: customer.name,
        customerAddress: customer.address || '',
        customerGst: customer.gst || '',
        selections: JSON.parse(JSON.stringify(selections)),
        total: totalPrice,
        currency: selectedCurrency,
    };
    
    try {
        await addDoc(collection(db, 'quotes'), quoteData);
        alert('✅ Quote saved successfully!');
        generatePDF(quoteData);
    } catch (error) {
        console.error("Error creating quote:", error);
        alert('❌ Failed to save quote.');
    } finally {
        setIsSaving(false);
    }
  };
  
  const CustomCostInput = ({ field, label }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="font-medium text-gray-700 self-center">{label}</label>
        <div className="flex gap-2">
             <input type="number" placeholder="Price (INR)" value={selections.customCosts[field]?.price || ''} onChange={e => handleCustomCostChange(field, 'price', e.target.value)} className="w-full px-2 py-1 border rounded" />
             <input type="text" placeholder="Notes / Remarks" value={selections.customCosts[field]?.notes || ''} onChange={e => handleCustomCostChange(field, 'notes', e.target.value)} className="w-full px-2 py-1 border rounded" />
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="text-green-600" />
          Generate New Quote
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer *</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
              <option value="">Choose a customer...</option>
              {customers.filter(c => c.status === 'Active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Currency</label>
            <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <QuoteStep number="1" title="Type Selection">
            <select onChange={(e) => handleSelectChange('type', e.target.value, pricingData.types)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Type (Model)</option>
                {(pricingData.types || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selections.type && (
                 <select onChange={(e) => handleSelectChange('series', e.target.value, selections.type.series)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select Series</option>
                    {(selections.type.series || []).map(s => <option key={s.id} value={s.id}>{s.name} (@ ₹{s.rate}/unit)</option>)}
                </select>
            )}
          </QuoteStep>
          
          <QuoteStep number="2" title="Component Selection">
             <HierarchicalSelector title="Body" structure={['Size', 'Rating', 'Material', 'End Connect']} data={pricingData.body[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, body: item}))} />
             <HierarchicalSelector title="Bonnet" structure={['Size', 'Rating', 'Material', 'Type']} data={pricingData.bonnet[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, bonnet: item}))} />
             <div className="border border-gray-200 rounded-md p-4 space-y-4 bg-white">
                <h4 className="font-semibold text-gray-800">Trim Components</h4>
                <HierarchicalSelector title="Plug" structure={['Size', 'Rating']} data={pricingData.trim_plug[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, trim_plug: item}))} />
                <HierarchicalSelector title="Seat" structure={['Size', 'Rating']} data={pricingData.trim_seat[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, trim_seat: item}))} />
                <HierarchicalSelector title="Cage" structure={['Size', 'Rating']} data={pricingData.trim_cage[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, trim_cage: item}))} />
                <HierarchicalSelector title="Stem" structure={['Size', 'Rating']} data={pricingData.trim_stem[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, trim_stem: item}))} />
             </div>
          </QuoteStep>
          
          <QuoteStep number="3" title="Fittings & Attachments">
              <select onChange={(e) => handleSelectChange('studs', e.target.value, pricingData.studs)} className="w-full px-3 py-2 border rounded-md"><option value="">Select Studs</option>{(pricingData.studs || []).map(s => <option key={s.id} value={s.id}>{s.name} (+₹{s.price})</option>)}</select>
              <select onChange={(e) => handleSelectChange('nuts', e.target.value, pricingData.nuts)} className="w-full px-3 py-2 border rounded-md"><option value="">Select Nuts</option>{(pricingData.nuts || []).map(n => <option key={n.id} value={n.id}>{n.name} (+₹{n.price})</option>)}</select>
              <select onChange={(e) => handleSelectChange('casket', e.target.value, pricingData.casket)} className="w-full px-3 py-2 border rounded-md"><option value="">Select Casket</option>{(pricingData.casket || []).map(c => <option key={c.id} value={c.id}>{c.name} (+₹{c.price})</option>)}</select>
              <select onChange={(e) => handleSelectChange('actuatorDiaphragm', e.target.value, pricingData.actuatorDiaphragm)} className="w-full px-3 py-2 border rounded-md"><option value="">Select Actuator (Diaphragm)</option>{(pricingData.actuatorDiaphragm || []).map(d => <option key={d.id} value={d.id}>{d.name} (+₹{d.price})</option>)}</select>
              <select onChange={(e) => handleSelectChange('actuatorPiston', e.target.value, pricingData.actuatorPiston)} className="w-full px-3 py-2 border rounded-md"><option value="">Select Actuator (Piston)</option>{(pricingData.actuatorPiston || []).map(p => <option key={p.id} value={p.id}>{p.name} (+₹{p.price})</option>)}</select>
              <select onChange={(e) => handleSelectChange('packing', e.target.value, pricingData.packingStandard)} className="w-full px-3 py-2 border rounded-md"><option value="">Select Standard Packing</option>{(pricingData.packingStandard || []).map(p => <option key={p.id} value={p.id}>{p.name} (+₹{p.price})</option>)}</select>
          </QuoteStep>
          
          <QuoteStep number="4" title="Finishing & Custom Costs">
              <HierarchicalSelector title="Painting" structure={['Size', 'Type of Paint']} data={pricingData.painting[0]?.data || []} onSelect={(item) => setSelections(s => ({...s, painting: item}))} />
              <div className="space-y-3 pt-4 mt-4 border-t">
                  <h4 className="font-semibold text-gray-700">Additional Custom Costs</h4>
                  {CUSTOM_COST_FIELDS.map(type => (
                    <CustomCostInput key={type} field={type} label={type} />
                  ))}
              </div>
          </QuoteStep>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mt-8 sticky bottom-4 border-2 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-700">Grand Total:</span>
              <span className="text-4xl font-bold text-green-600">
                {selectedCurrency} {totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
        </div>

        <button onClick={generateQuote} disabled={!selectedCustomer || isSaving}
          className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${!selectedCustomer || isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {isSaving ? 'Saving...' : <><Save size={20} /> Generate & Save Quote</>}
        </button>
      </div>
    </div>
  );
}

export default EmployeeDashboard;