import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Check, ArrowLeft, Receipt, CreditCard } from 'lucide-react';
import { usePOSTransaction } from '../context/POSTransaction';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const PaymentInterface = ({ onComplete, creditApplied = 0, availableCredit = null }) => {
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

  const finalTotal = Math.max(0, totals.grandTotal - creditApplied);
  const baseTotal = parseFloat(finalTotal.toFixed(2));

  const quickAmounts = [
    baseTotal,
    Math.ceil(baseTotal / 1) * 1,
    Math.ceil(baseTotal / 5) * 5,
    Math.ceil(baseTotal / 10) * 10,
    Math.ceil(baseTotal / 20) * 20,
    50, 100,
  ]
    .filter(amount => amount >= baseTotal)
    .reduce((unique, amount) => {
      if (!unique.find(a => Math.abs(a - amount) < 0.01)) {
        unique.push(amount);
      }
      return unique;
    }, [])
    .sort((a, b) => a - b)
    .slice(0, 6);

  useEffect(() => {
    const amount = parseFloat(cashInput) || 0;
    setCashReceived(amount);
  }, [cashInput]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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

    if (value === '.' && !cashInput.includes('.')) {
      setCashInput(prev => prev + '.');
      return;
    }

    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
      setCashInput(prev => {
        const newValue = prev + value.toString();
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

  const handleQuickAmount = (amount) => {
    if (paymentComplete) return;
    const roundedAmount = Math.round(amount * 100) / 100;
    setCashInput(roundedAmount.toFixed(2));
  };

  const handleProcessPayment = async () => {
    if (cashReceived.toFixed(2) < finalTotal.toFixed(2)) {
      toast.error('Insufficient cash received');
      return;
    }

    try {
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const receiptNumber = `RCP-${Date.now()}`;
      
      const actualCashPaid = cashReceived;
      const creditUsed = creditApplied;
      const changeGiven = Math.max(0, actualCashPaid - finalTotal);
      
      console.log('💰 Payment breakdown:', {
        originalTotal: totals.grandTotal,
        creditApplied: creditUsed,
        finalTotal: finalTotal,
        cashReceived: actualCashPaid,
        changeGiven: changeGiven
      });

      const taxBreakdown = {
        cultivation: totals.taxBreakdown?.cultivation || totals.cultivationTax || 0,
        excise: totals.taxBreakdown?.excise || totals.exciseTax || 0,
        sales: {
          state: totals.taxBreakdown?.sales?.state || totals.stateSalesTax || 0,
          county: totals.taxBreakdown?.sales?.county || totals.countySalesTax || 0,
          city: totals.taxBreakdown?.sales?.city || totals.citySalesTax || 0
        }
      };
      
      const transactionData = {
        transactionId: transactionId,
        items: items.map(item => ({
          id: item.id || item._id || item.productId,
          name: item.name,
          sku: item.sku,
          category: item.category,
          subcategory: item.subcategory,
          pricingOption: item.pricingOption,
          quantity: item.quantity,
          cannabis: item.cannabis || {}
        })),
        totals: {
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount || 0,
          discountedSubtotal: totals.discountedSubtotal || totals.subtotal,
          taxAmount: totals.taxAmount,
          grandTotal: totals.grandTotal,
          changeAmount: changeGiven,
          creditApplied: creditUsed,
          finalTotal: finalTotal,
          taxBreakdown: taxBreakdown
        },
        discount: totals.discountAmount > 0 ? {
          amount: totals.discountAmount,
          type: 'manual'
        } : null,
        paymentMethod: creditUsed > 0 ? 'cash+credit' : 'cash',
        cashReceived: actualCashPaid,
        customerInfo: {
          name: 'Walk-in Customer',
          phone: '',
          email: ''
        },
        receiptData: {
          receiptNumber: receiptNumber,
          timestamp: new Date(),
          localDateString: new Date().toLocaleDateString('en-US'),
          localTimeString: new Date().toLocaleTimeString('en-US'),
          printed: false,
          emailed: false,
          creditApplied: creditUsed,
          creditMemoNumber: creditUsed > 0 && availableCredit?.credits?.[0]?.creditMemoNumber || null
        }
      };

      // Save to database
      let savedTransaction;
      try {
        const response = await axiosInstance.post('/transactions', transactionData);
        savedTransaction = response.data.transaction;
        console.log('✅ Transaction saved to database:', savedTransaction._id);
      } catch (dbError) {
        console.error('❌ Failed to save transaction:', dbError);
        toast.error('Failed to create transaction');
        return;
      }

      // ✅ Apply credit across multiple memos
      if (creditApplied > 0 && availableCredit && availableCredit.credits) {
        try {
          let remainingToApply = creditApplied;
          const appliedCredits = [];
          
          console.log(`💳 Applying $${creditApplied} across ${availableCredit.credits.length} credit memo(s)`);
          
          for (const credit of availableCredit.credits) {
            if (remainingToApply <= 0) break;
            
            const amountToApplyToThisCredit = Math.min(
              credit.remainingBalance,
              remainingToApply
            );
            
            if (amountToApplyToThisCredit > 0) {
              console.log(`  Applying $${amountToApplyToThisCredit.toFixed(2)} to ${credit.creditMemoNumber}`);
              
              await axiosInstance.post('/rma/pos/apply-credit', {
                creditMemoNumber: credit.creditMemoNumber,
                amountToApply: amountToApplyToThisCredit,
                transactionId: savedTransaction._id,
                registerId: 'register-1'
              });
              
              appliedCredits.push({
                memoNumber: credit.creditMemoNumber,
                amount: amountToApplyToThisCredit
              });
              
              remainingToApply -= amountToApplyToThisCredit;
            }
          }

          // Update saved transaction with applied credits
          savedTransaction.receiptData.appliedCredits = appliedCredits;

          console.log('✅ Store credit applied successfully:', appliedCredits);
          toast.success(`Store credit applied: $${creditApplied.toFixed(2)} across ${appliedCredits.length} memo(s)`);
          
        } catch (creditError) {
          console.error('❌ Failed to apply credit:', creditError);
          toast.error('Transaction complete but credit tracking failed');
        }
      }

      // Update local state
      setTransaction(savedTransaction);
      setPaymentComplete(true);
    
      if (onComplete) {
        onComplete(savedTransaction);
      }
      
      toast.success('Payment successful!');
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
    }
  };

  const handleNewTransaction = () => {
    setPaymentComplete(false);
    setCashInput('');
    setTransaction(null);
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-7 w-7 text-green-600 mr-3" />
            Cash Payment
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Due</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(finalTotal)}
            </p>
          </div>
        </div>

        {creditApplied > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">
                  ✓ Store Credit Applied
                </p>
                {availableCredit?.customer && (
                  <p className="text-xs text-green-700 mt-1">
                    {availableCredit.customer.name}
                  </p>
                )}
              </div>
              <span className="text-2xl font-bold text-green-600">
                -${creditApplied.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Cash Only:</strong> In compliance with federal banking regulations, 
            cannabis transactions must be processed with cash only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Received</h3>
          
          <div className="mb-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Amount Received</p>
              <p className="text-4xl font-bold text-gray-900">
                ${cashInput || '0.00'}
              </p>
            </div>
          </div>

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
            
            <button
              onClick={() => handleNumberInput('backspace')}
              className="col-span-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              ← Backspace
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          
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

            {creditApplied > 0 && (
              <>
                <div className="flex justify-between text-base font-semibold text-green-600">
                  <span>Store Credit</span>
                  <span>-{formatCurrency(creditApplied)}</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-green-500">
                  <span>Amount Due</span>
                  <span className="text-green-600">{formatCurrency(finalTotal)}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              Math.round(cashReceived * 100) >= Math.round(finalTotal * 100)
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
                      cashReceived >= finalTotal ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {cashReceived >= finalTotal ? 'Change Due' : 'Still Owed'}
                    </span>
                    <span className={`text-xl font-bold ${
                      cashReceived >= finalTotal ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {formatCurrency(Math.abs(cashReceived - finalTotal))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleProcessPayment}
              disabled={parseFloat(cashReceived.toFixed(2)) < parseFloat(finalTotal.toFixed(2))}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                parseFloat(cashReceived.toFixed(2)) >= parseFloat(finalTotal.toFixed(2))
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {parseFloat(cashReceived.toFixed(2)) >= parseFloat(finalTotal.toFixed(2))
                ? `Complete Transaction ${(cashReceived - finalTotal) > 0 ? `• Change: ${formatCurrency(cashReceived - finalTotal)}` : ''}`
                : `Need ${formatCurrency(finalTotal - cashReceived)} More`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const getTransactionId = () => {
    return transaction.transactionId || transaction.id || transaction._id || 'N/A';
  };

  const getGrandTotal = () => {
    return transaction.totals?.grandTotal || 0;
  };

  const getCashReceived = () => {
    return transaction.receiptData?.cashReceived || transaction.cashReceived || 0;
  };

  const getChangeAmount = () => {
    return transaction.totals?.changeAmount || 0;
  };

  const getItemsCount = () => {
    return transaction.items?.length || 0;
  };

  return (
    <div className="text-center space-y-6">
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

      <div className="bg-white rounded-lg shadow p-6 text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction ID</span>
            <span className="font-medium">{getTransactionId()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-medium">{formatCurrency(getGrandTotal())}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Cash Received</span>
            <span className="font-medium">{formatCurrency(getCashReceived())}</span>
          </div>
          
          {getChangeAmount() > 0 && (
            <div className="flex justify-between text-green-600 font-bold">
              <span>Change Given</span>
              <span>{formatCurrency(getChangeAmount())}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{getItemsCount()} items</span>
          </div>
        </div>
      </div>

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