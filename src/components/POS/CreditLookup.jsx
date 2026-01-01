// frontend/src/components/pos/CreditLookup.jsx
// Store credit lookup for POS system

import React, { useState } from 'react';
import { Search, CreditCard, X, AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const CreditLookup = ({ onCreditFound }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [searchBy, setSearchBy] = useState('phone'); // 'phone' or 'email'
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const searchCredits = async () => {
    const searchValue = searchBy === 'phone' ? phone : email;
    
    if (!searchValue.trim()) {
      toast.error(`Enter customer ${searchBy}`);
      return;
    }

    setLoading(true);
    try {
      const params = searchBy === 'phone' ? { phone: searchValue } : { email: searchValue };
      
      const response = await axiosInstance.get('/rma/credits/search', { params });

      if (response.data.balance > 0) {
        setCredits(response.data);
        toast.success(`Found $${response.data.balance.toFixed(2)} in store credit!`);
        
        if (onCreditFound) {
          onCreditFound(response.data);
        }
      } else {
        toast.info('No store credit found for this customer');
        setCredits(null);
        if (onCreditFound) {
          onCreditFound(null);
        }
      }
    } catch (error) {
      toast.error('Failed to search credits');
      console.error(error);
      setCredits(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setPhone('');
    setEmail('');
    setCredits(null);
    setShowDetails(false);
    if (onCreditFound) {
      onCreditFound(null);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Store Credit Lookup</h3>
        </div>
        
        {credits && (
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        )}
      </div>

      {/* Search Type Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSearchBy('phone')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchBy === 'phone'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 hover:bg-blue-100'
          }`}
        >
          Phone
        </button>
        <button
          onClick={() => setSearchBy('email')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchBy === 'email'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 hover:bg-blue-100'
          }`}
        >
          Email
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        {searchBy === 'phone' ? (
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Customer phone (12345678)"
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && searchCredits()}
          />
        ) : (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Customer email"
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && searchCredits()}
          />
        )}
        
        <button
          onClick={searchCredits}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Credit Found */}
      {credits && credits.balance > 0 && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-white border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Credit</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${credits.balance.toFixed(2)}
                </p>
              </div>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            {credits.customer && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {credits.customer.name}
                </p>
                <p className="text-xs text-gray-500">
                  {credits.customer.phone && `Phone: ${credits.customer.phone}`}
                  {credits.customer.email && ` • Email: ${credits.customer.email}`}
                </p>
              </div>
            )}
          </div>

          {/* Credit Details */}
          {showDetails && credits.credits && credits.credits.length > 0 && (
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Credit Memos ({credits.credits.length})
              </h4>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {credits.credits.map((credit, index) => (
                  <div
                    key={index}
                    className="p-2 bg-blue-50 border border-blue-100 rounded text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-blue-900">
                        {credit.creditMemoNumber}
                      </span>
                      <span className="font-bold text-blue-600">
                        ${credit.remainingBalance.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                      <span>
                        Issued: {new Date(credit.issuedDate).toLocaleDateString()}
                      </span>
                      <span>
                        {credit.status === 'active' && '✓ Active'}
                        {credit.status === 'partially_used' && '⚡ Partially Used'}
                      </span>
                    </div>
                    
                    {credit.sourceDescription && (
                      <p className="text-xs text-gray-500 mt-1">
                        {credit.sourceDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Note */}
          <div className="flex items-start gap-2 p-3 bg-blue-100 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Credit will be automatically applied at checkout. Any unused balance will remain on the customer's account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditLookup;