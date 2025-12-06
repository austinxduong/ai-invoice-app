import React, { useState } from 'react';
import { Calculator, ShoppingCart, CreditCard, Receipt, Search } from 'lucide-react';
import { usePOSTransaction } from '../../context/POSTransaction';
import ProductSearch from '../../components/ProductSearch';
import TransactionSummary from '../../components/TransactionSummary';
import PaymentInterface from '../../components/PaymentInterface';
import ReceiptModal from '../../components/ReceiptModal';

const POSSystem = () => {
  const { hasItems, totals, itemCount } = usePOSTransaction();
  const [currentView, setCurrentView] = useState('products');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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
          {currentView === 'products' && <ProductSearch />}
       
          {currentView === 'payment' && <PaymentInterface onComplete={() => setShowReceiptModal(true)} />}
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

        {/* Transaction Summary - TEMPORARY PLACEHOLDER */}
        <div className="flex-1 overflow-auto">
            <TransactionSummary />
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
        <ReceiptModal onClose={() => setShowReceiptModal(false)} />
      )} 
    </div>
  );
};

export default POSSystem;