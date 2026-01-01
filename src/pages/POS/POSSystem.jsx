import React, { useState } from 'react';
import { Calculator, ShoppingCart, CreditCard, Receipt, Search } from 'lucide-react';
import { usePOSTransaction } from '../../context/POSTransaction';
import ProductSearch from '../../components/ProductSearch';
import TransactionSummary from '../../components/TransactionSummary';
import PaymentInterface from '../../components/PaymentInterface';
import ReceiptModal from '../../components/ReceiptModal';
import CreditLookup from '../../components/POS/CreditLookup';

const POSSystem = () => {
  const { hasItems, totals, itemCount } = usePOSTransaction();
  const [currentView, setCurrentView] = useState('products');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  
  // ✅ Store credit state
  const [availableCredit, setAvailableCredit] = useState(null);
  const [creditApplied, setCreditApplied] = useState(0);

  const handlePaymentComplete = async (transactionPromise) => {
    try {
      console.log('💳 Payment processing...');
      
      const transaction = await transactionPromise;
      
      console.log('💳 Payment completed, showing receipt for:', transaction);
      
      if (transaction) {
        setCompletedTransaction(transaction);
        setCurrentView('products');
        setShowReceiptModal(true);
        
        // Reset credit state after successful transaction
        setAvailableCredit(null);
        setCreditApplied(0);
      } else {
        console.error('❌ No transaction received');
      }
      
    } catch (error) {
      console.error('❌ Error completing payment:', error);
    }
  };

  // Handle credit found from lookup
  const handleCreditFound = (creditData) => {
    setAvailableCredit(creditData);
    console.log('💳 Store credit found:', creditData);
  };

  // Apply store credit to transaction
  const applyCredit = () => {
    if (!availableCredit || availableCredit.balance <= 0) return;
    
    const maxCredit = Math.min(
      availableCredit.balance,
      totals.grandTotal
    );
    
    setCreditApplied(maxCredit);
    console.log(`💳 Applied $${maxCredit.toFixed(2)} store credit`);
  };

  // Remove applied credit
  const removeCredit = () => {
    setCreditApplied(0);
  };

  // Calculate final total after credit
  const finalTotal = Math.max(0, totals.grandTotal - creditApplied);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Product Search & Add */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calculator className="h-8 w-8 text-green-600 mr-3" />
              Cannabis POS System
            </h1>
            
            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('products')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'products'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Products
              </button>
              
              <button
                onClick={() => setCurrentView('payment')}
                disabled={!hasItems}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'payment' && hasItems
                    ? 'bg-blue-600 text-white'
                    : hasItems
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                Payment
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Products View */}
          {currentView === 'products' && <ProductSearch />}
          
          {/* Payment View */}
          {currentView === 'payment' && (
            <div className="space-y-6">
              {/* ✅ Credit Lookup - ALWAYS show in payment view */}
              <CreditLookup onCreditFound={handleCreditFound} />
              
              {/* Payment Interface */}
              <PaymentInterface 
                onComplete={handlePaymentComplete}
                creditApplied={creditApplied}
                availableCredit={availableCredit}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Transaction Summary */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Transaction Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
              Current Transaction
            </h2>
            
            {itemCount > 0 && (
              <span className="bg-green-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                {itemCount} items
              </span>
            )}
          </div>
          
          {totals.grandTotal > 0 && (
            <div className="mt-2">
              <span className="text-2xl font-bold text-green-600">
                ${totals.grandTotal.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Transaction Summary */}
        <div className="flex-1 overflow-auto">
          <TransactionSummary />
          
          {/* ✅ Store Credit Section in Summary */}
          {hasItems && availableCredit && availableCredit.balance > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-blue-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Store Credit Available
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    ${availableCredit.balance.toFixed(2)}
                  </span>
                </div>
                
                {availableCredit.customer && (
                  <p className="text-xs text-blue-700">
                    {availableCredit.customer.name} • {availableCredit.credits.length} credit memo(s)
                  </p>
                )}
                
                {creditApplied === 0 ? (
                  <button
                    onClick={applyCredit}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                  >
                    Apply ${Math.min(availableCredit.balance, totals.grandTotal).toFixed(2)} Credit
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                      <span className="text-sm font-medium text-green-600">
                        ✓ Credit Applied
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        -${creditApplied.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={removeCredit}
                      className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors text-sm"
                    >
                      Remove Credit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* ✅ Final Total After Credit */}
          {creditApplied > 0 && (
            <div className="px-4 py-3 border-t-2 border-green-500 bg-green-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Final Total
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Credit: -${creditApplied.toFixed(2)} • Balance: ${(availableCredit.balance - creditApplied).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentView('payment')}
              disabled={!hasItems}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                hasItems
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="h-4 w-4 inline mr-2" />
              Pay Now
            </button>
            
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              <Receipt className="h-4 w-4 inline mr-2" />
              Receipt
            </button>
          </div>
        </div>
      </div>

      {showReceiptModal && (
        <ReceiptModal 
          onClose={() => {
            setShowReceiptModal(false);
            setCompletedTransaction(null);
          }} 
          transaction={completedTransaction}
        />
      )}
    </div>
  );
};

export default POSSystem;