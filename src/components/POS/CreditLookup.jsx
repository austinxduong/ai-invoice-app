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
  const [selectedCredits, setSelectedCredits] = useState([]);

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
        // Auto-select all credits by default
        setSelectedCredits(response.data.credits.map(c => c._id));
        toast.success(`Found $${response.data.balance.toFixed(2)} in store credit!`);
        
        // Pass the full credit data with selected credits
        if (onCreditFound) {
          onCreditFound({
            ...response.data,
            selectedCredits: response.data.credits // All selected by default
          });
        }
      } else {
        toast.info('No store credit found for this customer');
        setCredits(null);
        setSelectedCredits([]);
        if (onCreditFound) {
          onCreditFound(null);
        }
      }
    } catch (error) {
      toast.error('Failed to search credits');
      console.error(error);
      setCredits(null);
      setSelectedCredits([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCreditSelection = (creditId) => {
    setSelectedCredits(prev => {
      const newSelected = prev.includes(creditId)
        ? prev.filter(id => id !== creditId)
        : [...prev, creditId];
      
      // Notify parent with updated selection
      if (onCreditFound && credits) {
        const selectedCreditObjects = credits.credits.filter(c => newSelected.includes(c._id));
        const selectedBalance = selectedCreditObjects.reduce((sum, c) => sum + c.remainingBalance, 0);
        
        onCreditFound({
          ...credits,
          selectedCredits: selectedCreditObjects,
          balance: selectedBalance // Update balance to selected only
        });
      }
      
      return newSelected;
    });
  };

  const selectAll = () => {
    const allIds = credits.credits.map(c => c._id);
    setSelectedCredits(allIds);
    
    if (onCreditFound && credits) {
      onCreditFound({
        ...credits,
        selectedCredits: credits.credits,
        balance: credits.credits.reduce((sum, c) => sum + c.remainingBalance, 0)
      });
    }
  };

  const deselectAll = () => {
    setSelectedCredits([]);
    
    if (onCreditFound && credits) {
      onCreditFound({
        ...credits,
        selectedCredits: [],
        balance: 0
      });
    }
  };

  const clearSearch = () => {
    setPhone('');
    setEmail('');
    setCredits(null);
    setShowDetails(false);
    setSelectedCredits([]);
    if (onCreditFound) {
      onCreditFound(null);
    }
  };

  // Calculate selected balance
  const selectedBalance = credits?.credits
    ?.filter(c => selectedCredits.includes(c._id))
    ?.reduce((sum, c) => sum + c.remainingBalance, 0) || 0;

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
      {credits && credits.credits && credits.credits.length > 0 && (
        <div className="mt-4 space-y-3">
          {/* Selected Balance Summary */}
          <div className="p-4 bg-white border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Credit</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${selectedBalance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCredits.length} of {credits.credits.length} memos selected
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

          {/* Credit Selection */}
          {showDetails && (
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Select Credit Memos
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Select All
                  </button>
                  <span className="text-xs text-gray-400">|</span>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {credits.credits.map((credit) => (
                  <div
                    key={credit._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedCredits.includes(credit._id)
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    }`}
                    onClick={() => toggleCreditSelection(credit._id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCredits.includes(credit._id)}
                        onChange={() => toggleCreditSelection(credit._id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-blue-900 text-sm">
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
                    </div>
                  </div>
                ))}
              </div>

              {selectedCredits.length === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ No credits selected. Select at least one credit memo to apply.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Usage Note */}
          <div className="flex items-start gap-2 p-3 bg-blue-100 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Selected credits will be applied at checkout. Any unused balance will remain on the customer's account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditLookup;