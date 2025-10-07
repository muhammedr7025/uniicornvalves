// src/components/QuoteStep.js

import React from 'react';

function QuoteStep({ number, title, children }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="mb-4">
        <h3 className="font-bold text-xl text-gray-800">
          <span className="text-indigo-600">{number}.</span> {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default QuoteStep;