import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Check, ArrowLeft, Receipt } from 'lucide-react';
import { usePOSTransaction } from '../context/POSTransaction';
// import { usePOSTransaction } from '../../../context/POSTransactionContext';

const PaymentInterface = ({ onComplete }) => {
  const { 
    totals, 
    items, 
    setCashReceived, 
    cashReceived, 
    completeTransaction,
    clearTransaction 
  } = usePOSTransaction();

  const [cashInput, setCashInput] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transaction, setTransaction] = useState(null);

  // Quick cash amounts for easy selection
  const quickAmounts = [
    totals.grandTotal, // Exact amount
    Math.ceil(totals.grandTotal / 5) * 5, // Round to nearest $5
    Math.ceil(totals.grandTotal / 10) * 10, // Round to nearest $10
    Math.ceil(totals.grandTotal / 20) * 20, // Round to nearest $20
    50, 100 // Common cash amounts
  ].filter((amount, index, arr) => 
    amount >= totals.grandTotal && arr.indexOf(amount) === index
  ).sort((a, b) => a - b);

  // Update cash received when input changes
  useEffect(() => {
    const amount = parseFloat(cashInput) || 0;
    setCashReceived(amount);
  }, [cashInput, setCashReceived]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle number pad input
  const handleNumberInput = (value) => {
    if (paymentComplete) return;

    if (value === 'clear') {
      setCashInput('');
      return;
    }

    if (value === 'backspace') {
      setCashInput(prev => prev.slice(0, -1));
      return;
    }

    // Handle decimal point
    if (value === '.' && !cashInput.includes('.')) {
      setCashInput(prev => prev + '.');
      return;
    }

    // Handle numbers
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
      setCashInput(prev => {
        const newValue = prev + value.toString();
        // Prevent more than 2 decimal places
        if (newValue.includes('.')) {
          const parts = newValue.split('.');
          if (parts[1] && parts[1].length > 2) {
            return prev;
          }
        }
        return newValue;
      });
    }
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount) => {
    if (paymentComplete) return;
    setCashInput(amount.toString());
  };

  // Process payment
  const handleProcessPayment = () => {
    if (cashReceived < totals.grandTotal) {
      alert('Insufficient cash received');
      return;
    }

    // create comprehensive receipt data
    const receiptData = {
        cashReceived,
        changeAmount: totals.changeAmount,
        paymentMethod: 'cash',
        timestamp: new Date(),

        itesm:items.map(item => ({
            lineTotal:(item.pricingOption?.price || 0) * item.quantity
        })),
        totals: {
            ...totals,
            itemCount: items.length
        }
    };

    const completedTransaction = completeTransaction(receiptData);

    setTransaction(completedTransaction);
    setPaymentComplete(true);
  
    if (onComplete) {
        onComplete(completedTransaction);
    }
};

//     const completedTransaction = completeTransaction({
//       cashReceived,
//       changeAmount: totals.changeAmount,
//       paymentMethod: 'cash',
//       timestamp: new Date()
//     });

//     setTransaction(completedTransaction);
//     setPaymentComplete(true);
    
//     if (onComplete) {
//       onComplete(completedTransaction);
//     }
//   };

  // Start new transaction
  const handleNewTransaction = () => {
    setPaymentComplete(false);
    setCashInput('');
    setTransaction(null);
    // Don't clear transaction here - let the user decide
  };

  if (paymentComplete && transaction) {
    return (
      <PaymentComplete 
        transaction={transaction}
        onNewTransaction={handleNewTransaction}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-7 w-7 text-green-600 mr-3" />
            Cash Payment
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Due</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totals.grandTotal)}
            </p>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Cash Only:</strong> In compliance with federal banking regulations, 
            cannabis transactions must be processed with cash only.
          </p>
        </div>
      </div>

      {/* Cash Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Cash Input */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Received</h3>
          
          {/* Cash Display */}
          <div className="mb-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Amount Received</p>
              <p className="text-4xl font-bold text-gray-900">
                ${cashInput || '0.00'}
              </p>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Amounts</p>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.slice(0, 6).map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2">
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-medium transition-colors"
              >
                {num}
              </button>
            ))}
            
            {/* Bottom Row */}
            <button
              onClick={() => handleNumberInput('clear')}
              className="p-4 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
            >
              Clear
            </button>
            
            <button
              onClick={() => handleNumberInput(0)}
              className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-medium transition-colors"
            >
              0
            </button>
            
            <button
              onClick={() => handleNumberInput('.')}
              className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-medium transition-colors"
            >
              .
            </button>
            
            {/* Backspace */}
            <button
              onClick={() => handleNumberInput('backspace')}
              className="col-span-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              ← Backspace
            </button>
          </div>
        </div>

        {/* Right: Transaction Summary & Change */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          
          {/* Transaction Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items ({items.length})</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cannabis Tax</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Due</span>
                <span className="text-green-600">{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              cashReceived >= totals.grandTotal
                ? 'bg-green-50 border-green-200'
                : cashReceived > 0
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-medium">Cash Received</span>
                <span className="text-lg font-bold">
                  {formatCurrency(cashReceived)}
                </span>
              </div>
              
              {cashReceived > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${
                      cashReceived >= totals.grandTotal ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {cashReceived >= totals.grandTotal ? 'Change Due' : 'Still Owed'}
                    </span>
                    <span className={`text-xl font-bold ${
                      cashReceived >= totals.grandTotal ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {formatCurrency(Math.abs(cashReceived - totals.grandTotal))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Process Payment Button */}
            <button
              onClick={handleProcessPayment}
              disabled={cashReceived < totals.grandTotal}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                cashReceived >= totals.grandTotal
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {cashReceived >= totals.grandTotal
                ? `Complete Transaction ${totals.changeAmount > 0 ? `• Change: ${formatCurrency(totals.changeAmount)}` : ''}`
                : `Need ${formatCurrency(totals.grandTotal - cashReceived)} More`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Complete Component
const PaymentComplete = ({ transaction, onNewTransaction }) => {
  const { clearTransaction } = usePOSTransaction();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleNewTransaction = () => {
    clearTransaction();
    onNewTransaction();
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Header */}
      <div className="bg-green-50 rounded-lg p-8">
        <div className="flex justify-center mb-4">
          <div className="bg-green-600 rounded-full p-3">
            <Check className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Transaction Complete!
        </h2>
        <p className="text-green-700">
          Payment processed successfully
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-lg shadow p-6 text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction ID</span>
            <span className="font-medium">{transaction.id}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-medium">{formatCurrency(transaction.totals.grandTotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Cash Received</span>
            <span className="font-medium">{formatCurrency(transaction.receiptData.cashReceived)}</span>
          </div>
          
          {transaction.totals.changeAmount > 0 && (
            <div className="flex justify-between text-green-600 font-bold">
              <span>Change Given</span>
              <span>{formatCurrency(transaction.totals.changeAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{transaction.items.length} items</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleNewTransaction}
          className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
        >
          <DollarSign className="h-5 w-5 mr-2" />
          New Transaction
        </button>
        
        <button
          onClick={() => window.print()}
          className="px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
        >
          <Receipt className="h-5 w-5 mr-2" />
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PaymentInterface;