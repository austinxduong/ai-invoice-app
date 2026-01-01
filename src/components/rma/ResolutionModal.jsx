// frontend/src/components/rma/ResolutionModal.jsx
// Modern button grid for RMA resolution selection

import React, { useState } from 'react';
import { DollarSign, FileText, RotateCcw, XCircle, X } from 'lucide-react';

const ResolutionModal = ({ rma, onClose, onResolve, onOpenRefundModal }) => {
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    creditAmount: rma.totalValue || 0,
    creditMemoNumber: '',
    replacementOrderId: ''
  });

  const handleResolve = async () => {
    setLoading(true);
    try {
      await onResolve({
        resolutionType: selectedType,
        creditAmount: form.creditAmount,
        creditMemoNumber: form.creditMemoNumber,
        replacementOrderId: form.replacementOrderId
      });
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const resolutionOptions = [
    {
      type: 'refund',
      icon: DollarSign,
      title: 'Cash Refund',
      description: 'Return money to customer',
      color: 'green',
      onClick: () => {
        onClose();
        onOpenRefundModal();
      }
    },
    {
      type: 'store_credit',
      icon: FileText,
      title: 'Store Credit',
      description: 'Issue credit memo',
      color: 'blue',
      onClick: () => setSelectedType('store_credit')
    },
    {
      type: 'replacement',
      icon: RotateCcw,
      title: 'Replacement',
      description: 'Send new product',
      color: 'purple',
      onClick: () => setSelectedType('replacement')
    },
    {
      type: 'reject',
      icon: XCircle,
      title: 'Reject Claim',
      description: 'Deny this return',
      color: 'red',
      onClick: () => setSelectedType('reject')
    }
  ];

  const getColorClasses = (color, isSelected = false) => {
    const colors = {
      green: {
        border: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50',
        icon: 'bg-green-100 group-hover:bg-green-200',
        iconColor: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      },
      blue: {
        border: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50',
        icon: 'bg-blue-100 group-hover:bg-blue-200',
        iconColor: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        border: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50',
        icon: 'bg-purple-100 group-hover:bg-purple-200',
        iconColor: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      red: {
        border: isSelected ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500 hover:bg-red-50',
        icon: 'bg-red-100 group-hover:bg-red-200',
        iconColor: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      }
    };
    return colors[color];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Resolve RMA</h3>
            <p className="text-sm text-gray-600 mt-1">Choose how to resolve this return</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* RMA Summary */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">RMA Number</p>
                <p className="font-semibold text-gray-900">{rma.rmaNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{rma.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Value</p>
                <p className="font-semibold text-gray-900">${rma.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {resolutionOptions.map((option) => {
              const Icon = option.icon;
              const colors = getColorClasses(option.color, selectedType === option.type);
              
              return (
                <button
                  key={option.type}
                  onClick={option.onClick}
                  className={`p-4 border-2 rounded-lg transition-all group ${colors.border}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${colors.icon}`}>
                      <Icon className={`w-7 h-7 ${colors.iconColor}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-base">{option.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Store Credit Form */}
          {selectedType === 'store_credit' && (
            <div className="space-y-4 border-t border-gray-200 pt-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Store Credit Details</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.creditAmount} 
                    onChange={(e) => setForm({ ...form, creditAmount: parseFloat(e.target.value) })} 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Memo Number *
                </label>
                <input 
                  type="text" 
                  value={form.creditMemoNumber} 
                  onChange={(e) => setForm({ ...form, creditMemoNumber: e.target.value })} 
                  placeholder="CM-2025-001" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 Credit will be added to customer account and can be used on future purchases at POS.
                </p>
              </div>
              
              <button 
                onClick={handleResolve} 
                disabled={loading || !form.creditMemoNumber.trim()} 
                className={`w-full px-4 py-3 text-white rounded-lg disabled:opacity-50 font-medium ${getColorClasses('blue').button}`}
              >
                {loading ? 'Processing...' : 'Issue Store Credit'}
              </button>
            </div>
          )}

          {/* Replacement Form */}
          {selectedType === 'replacement' && (
            <div className="space-y-4 border-t border-gray-200 pt-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Replacement Details</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replacement Order/Invoice ID *
                </label>
                <input 
                  type="text" 
                  value={form.replacementOrderId} 
                  onChange={(e) => setForm({ ...form, replacementOrderId: e.target.value })} 
                  placeholder="INV-2025-001" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the invoice number for the replacement products
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  💡 Make sure replacement products have been picked and are ready to ship before marking as resolved.
                </p>
              </div>
              
              <button 
                onClick={handleResolve} 
                disabled={loading || !form.replacementOrderId.trim()} 
                className={`w-full px-4 py-3 text-white rounded-lg disabled:opacity-50 font-medium ${getColorClasses('purple').button}`}
              >
                {loading ? 'Processing...' : 'Process Replacement'}
              </button>
            </div>
          )}

          {/* Reject Warning */}
          {selectedType === 'reject' && (
            <div className="space-y-4 border-t border-gray-200 pt-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-gray-900">Reject Claim</h4>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  ⚠️ Warning: This will deny the customer's return request
                </p>
                <p className="text-xs text-red-800">
                  This action should be used when:
                </p>
                <ul className="text-xs text-red-800 mt-2 ml-4 list-disc space-y-1">
                  <li>Inspection reveals customer error or misuse</li>
                  <li>Product doesn't match what was originally sold</li>
                  <li>Return is outside of policy window</li>
                  <li>Evidence of fraud or tampering</li>
                  <li>Product is in acceptable condition</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  💡 Customer will be notified that their return claim has been rejected. Make sure internal notes document the reason.
                </p>
              </div>
              
              <button 
                onClick={handleResolve} 
                disabled={loading} 
                className={`w-full px-4 py-3 text-white rounded-lg disabled:opacity-50 font-medium ${getColorClasses('red').button}`}
              >
                {loading ? 'Processing...' : 'Reject Claim'}
              </button>
            </div>
          )}

          {/* Cancel Button */}
          {!selectedType && (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Back to Selection */}
          {selectedType && (
            <button
              onClick={() => setSelectedType('')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mt-3"
            >
              ← Back to Resolution Options
            </button>
          )}
        </div>

        {/* Add fade-in animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ResolutionModal;