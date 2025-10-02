// FIXED: QuoteHistory.js - With proper error handling
// Location: src/components/QuoteHistory.js
// Action: CREATE NEW FILE or REPLACE existing

import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FileText, Download, Trash2, Eye, X } from 'lucide-react';

function QuoteHistory({ userRole }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const quotesRef = collection(db, 'quotes');
      const q = query(quotesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedQuotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setQuotes(loadedQuotes);
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Failed to load quotes. Make sure Firestore is properly configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quoteId) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await deleteDoc(doc(db, 'quotes', quoteId));
      setQuotes(quotes.filter(q => q.id !== quoteId));
      alert('Quote deleted successfully');
    } catch (err) {
      console.error('Error deleting quote:', err);
      alert('Failed to delete quote: ' + err.message);
    }
  };

  const handleDownload = (quote) => {
    // Simple download - create a formatted text file
    const content = generateQuoteText(quote);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quote_${quote.quoteNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateQuoteText = (quote) => {
    let text = '═══════════════════════════════════════\n';
    text += '     UNICORN VALVES ESTIMATE\n';
    text += '═══════════════════════════════════════\n\n';
    text += `Quote Number: ${quote.quoteNumber}\n`;
    text += `Date: ${quote.date}\n\n`;
    text += 'CUSTOMER DETAILS:\n';
    text += `${quote.customerName || 'N/A'}\n`;
    text += `${quote.customerEmail || 'N/A'}\n`;
    text += `${quote.customerPhone || 'N/A'}\n\n`;
    text += '───────────────────────────────────────\n';
    text += 'ITEMS:\n\n';
    
    if (quote.items && Array.isArray(quote.items)) {
      quote.items.forEach((item, index) => {
        text += `${index + 1}. ${item.moduleName}\n`;
        text += `   ${item.moduleDescription || ''}\n`;
        if (item.breakdown && Array.isArray(item.breakdown)) {
          item.breakdown.forEach(b => {
            text += `   ${b.level}: ${b.name} - $${b.price.toLocaleString()}\n`;
          });
        }
        text += `   Module Total: $${(item.moduleTotal || 0).toLocaleString()}\n\n`;
      });
    }
    
    text += '═══════════════════════════════════════\n';
    text += `GRAND TOTAL: $${(quote.total || 0).toLocaleString()}\n`;
    text += '═══════════════════════════════════════\n';
    
    return text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-red-600 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Quotes</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadQuotes}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-indigo-600" />
              Quote History
            </h2>
            <p className="text-gray-600 mt-1">View and manage all generated quotes</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{quotes.length}</p>
            <p className="text-sm text-gray-600">Total Quotes</p>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      {quotes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quote #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {quote.quoteNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{quote.customerName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{quote.customerEmail || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quote.date || new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ${(quote.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(quote)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDelete(quote.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quotes Yet</h3>
          <p className="text-gray-500 mb-4">
            {userRole === 'admin' 
              ? 'Quotes generated by employees will appear here.'
              : 'Start generating quotes to see them listed here.'}
          </p>
        </div>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal 
          quote={selectedQuote} 
          onClose={() => setSelectedQuote(null)} 
        />
      )}
    </div>
  );
}

// Quote Detail Modal Component
function QuoteDetailModal({ quote, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quote Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Quote Header Info */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Quote Number</p>
              <p className="font-mono font-semibold text-lg">{quote.quoteNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-semibold text-lg">{quote.date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer</p>
              <p className="font-semibold text-lg">{quote.customerName || 'N/A'}</p>
              <p className="text-sm text-gray-500">{quote.customerEmail || ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-green-600">
                ${(quote.total || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">Items:</h3>
            {quote.items && Array.isArray(quote.items) && quote.items.length > 0 ? (
              quote.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-2">{item.moduleName}</h4>
                  <p className="text-sm text-gray-600 mb-3">{item.moduleDescription}</p>
                  
                  {item.breakdown && Array.isArray(item.breakdown) && item.breakdown.length > 0 ? (
                    <div className="space-y-1 mb-3">
                      {item.breakdown.map((b, i) => (
                        <div key={i} className="flex justify-between text-sm py-1 px-2 bg-white rounded">
                          <span className="text-gray-700">
                            <span className="text-gray-500">{b.level}:</span> {b.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${(b.price || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">No breakdown available</p>
                  )}
                  
                  <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-semibold bg-white px-2 py-1 rounded">
                    <span>Module Total</span>
                    <span className="text-green-600">
                      ${(item.moduleTotal || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No items in this quote</p>
            )}
          </div>

          {/* Grand Total */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Grand Total:</span>
              <span className="text-4xl font-bold text-green-600">
                ${(quote.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuoteHistory;