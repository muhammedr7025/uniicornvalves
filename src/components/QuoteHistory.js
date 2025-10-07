// src/components/QuoteHistory.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { FileText, X, Clock } from 'lucide-react';

const DetailRow = ({ label, item, details, isHeader = false }) => {
  if (!item && !isHeader) return null;
  if (isHeader) {
    return <h4 className="font-bold mt-4 mb-2 text-gray-800 border-b pb-1">{label}</h4>;
  }
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-right">{item.name} {details && <span className="text-xs text-gray-500">({details})</span>}</span>
    </div>
  );
};

const CustomCostRow = ({ label, cost }) => {
  if (!cost || parseFloat(cost.price) <= 0) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-right">₹{cost.price} {cost.notes && <span className="text-xs text-gray-500">({cost.notes})</span>}</span>
    </div>
  );
};


function QuoteHistory({ userRole }) {
  const { currentUser } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = (userRole === 'admin')
          ? query(collection(db, 'quotes'), orderBy('createdAt', 'desc'))
          : query(collection(db, 'quotes'), where('createdBy', '==', currentUser.email), orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        setQuotes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching quotes:", err);
        setError("Could not fetch quotes. This is likely due to a missing database index. Please open the browser console (Ctrl+Shift+J), find the Firestore error message, and click the link to create the required index.");
      }
      setLoading(false);
    };
    fetchQuotes();
  }, [userRole, currentUser.email]);

  const renderQuoteDetails = () => {
    if (!selectedQuote) return null;
    const { selections } = selectedQuote;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
          <div className="p-6 sticky top-0 bg-white border-b z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedQuote.quoteNumber}</h2>
                <p className="text-sm text-gray-500">For: {selectedQuote.customerName} {selectedQuote.customerGst && `(GST: ${selectedQuote.customerGst})`}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="p-2 rounded-full hover:bg-gray-100"><X /></button>
            </div>
          </div>
          <div className="p-6 text-sm flex-grow">
            <DetailRow isHeader label="Base Configuration" />
            <DetailRow label="Model / Type" item={selections.type} />
            <DetailRow label="Series" item={selections.series} details={`Rate: ₹${selections.series?.rate}/unit`} />
            
            <DetailRow isHeader label="Components" />
            <DetailRow label="Body" item={selections.body} details={`Wt: ${selections.body?.weight}, MC: ₹${selections.body?.machining_charge}`} />
            <DetailRow label="Bonnet" item={selections.bonnet} details={`Wt: ${selections.bonnet?.weight}, MC: ₹${selections.bonnet?.machining_charge}`} />

            <DetailRow isHeader label="Trim" />
            <DetailRow label="Plug" item={selections.trim_plug} details={`Wt: ${selections.trim_plug?.weight}, MC: ₹${selections.trim_plug?.machining_charge}`} />
            <DetailRow label="Seat" item={selections.trim_seat} details={`Wt: ${selections.trim_seat?.weight}, MC: ₹${selections.trim_seat?.machining_charge}`} />
            <DetailRow label="Cage" item={selections.trim_cage} details={`Wt: ${selections.trim_cage?.weight}, MC: ₹${selections.trim_cage?.machining_charge}`} />
            <DetailRow label="Stem" item={selections.trim_stem} details={`Wt: ${selections.trim_stem?.weight}, MC: ₹${selections.trim_stem?.machining_charge}`} />

            <DetailRow isHeader label="Fittings & Finishing" />
            <DetailRow label="Studs" item={selections.studs} details={`+₹${selections.studs?.price}`} />
            <DetailRow label="Nuts" item={selections.nuts} details={`+₹${selections.nuts?.price}`} />
            <DetailRow label="Casket" item={selections.casket} details={`+₹${selections.casket?.price}`} />
            <DetailRow label="Std. Packing" item={selections.packing} details={`+₹${selections.packing?.price}`} />
            <DetailRow label="Painting" item={selections.painting} details={`+₹${selections.painting?.price}`} />

            <DetailRow isHeader label="Actuators" />
            <DetailRow label="Pneumatic (D)" item={selections.actuatorDiaphragm} details={`+₹${selections.actuatorDiaphragm?.price}`} />
            <DetailRow label="Pneumatic (P)" item={selections.actuatorPiston} details={`+₹${selections.actuatorPiston?.price}`} />
            
            <DetailRow isHeader label="Additional Costs" />
            {Object.entries(selections.customCosts).map(([name, cost]) => (
                <CustomCostRow key={name} label={name} cost={cost} />
            ))}
          </div>
           <div className="p-6 sticky bottom-0 bg-gray-50 border-t text-right">
                <span className="text-lg font-bold">Grand Total: </span>
                <span className="text-2xl font-extrabold text-green-600">{selectedQuote.currency} {selectedQuote.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" /> Quote History
      </h2>
      {loading && <p>Loading history...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && quotes.length === 0 && <p>No quotes found.</p>}
      {!loading && !error && quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map(quote => (
            <div key={quote.id} className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="col-span-2">
                <p className="font-bold text-gray-800">{quote.quoteNumber}</p>
                <p className="text-sm text-gray-600">{quote.customerName}</p>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14}/> {new Date(quote.createdAt).toLocaleDateString()}</div>
              <div className="font-semibold text-lg text-right">{quote.currency} {quote.total.toLocaleString()}</div>
              <div className="text-right">
                <button onClick={() => setSelectedQuote(quote)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-200">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {renderQuoteDetails()}
    </div>
  );
}

export default QuoteHistory;