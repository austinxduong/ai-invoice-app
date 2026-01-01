// frontend/src/components/rma/CashRefundModal.jsx
// Modal for processing cash refunds with register tracking

import React, { useState } from 'react';
import { DollarSign, Printer, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CashRefundModal = ({ rma, onClose, onComplete }) => {
  const [form, setForm] = useState({
    refundAmount: rma.totalValue || 0,
    registerId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [printReceipt, setPrintReceipt] = useState(true);

  // Common register options (customize for your dispensary)
  const registers = [
    { id: 'register-1', name: 'Register 1 - Main Counter' },
    { id: 'register-2', name: 'Register 2 - Express Lane' },
    { id: 'register-3', name: 'Register 3 - Medical Only' },
    { id: 'register-4', name: 'Register 4 - Manager Station' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (form.refundAmount <= 0) {
      toast.error('Refund amount must be greater than $0');
      return;
    }

    if (form.refundAmount > rma.totalValue) {
      toast.error(`Refund amount cannot exceed RMA total ($${rma.totalValue.toFixed(2)})`);
      return;
    }

    if (!form.registerId) {
      toast.error('Please select a cash register');
      return;
    }

    setLoading(true);
    try {
      const result = await onComplete(form, printReceipt);
      
      if (printReceipt && result?.receipt) {
        // Receipt will be handled by parent component
        toast.success('Cash refund processed! Printing receipt...');
      } else {
        toast.success('Cash refund processed successfully!');
      }
      
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  const selectedRegister = registers.find(r => r.id === form.registerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Process Cash Refund</h3>
                <p className="text-sm text-gray-600">RMA {rma.rmaNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cannabis Cash-Only Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Cash Refund Only</p>
              <p className="text-xs text-blue-700 mt-1">
                Cannabis purchases must be refunded in cash due to federal banking regulations.
              </p>
            </div>
          </div>

          {/* Refund Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max={rma.totalValue}
                value={form.refundAmount}
                onChange={(e) => setForm({ ...form, refundAmount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum refund: ${rma.totalValue.toFixed(2)}
            </p>
          </div>

          {/* Register Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Register *
            </label>
            <select
              value={form.registerId}
              onChange={(e) => setForm({ ...form, registerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select register...</option>
              {registers.map(register => (
                <option key={register.id} value={register.id}>
                  {register.name}
                </option>
              ))}
            </select>
            {selectedRegister && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Cash will be dispensed from {selectedRegister.name}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Additional notes about this refund..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Print Receipt Option */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="print-receipt"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="print-receipt" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <Printer className="w-4 h-4" />
              Print refund receipt for customer
            </label>
          </div>

          {/* Customer Info Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {rma.customerName}</p>
              {rma.customerEmail && <p><span className="font-medium">Email:</span> {rma.customerEmail}</p>}
              {rma.customerPhone && <p><span className="font-medium">Phone:</span> {rma.customerPhone}</p>}
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Items Being Refunded</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {rma.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{item.productName}</span>
                  <span className="text-gray-600">${item.totalValue.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 mt-2 pt-2 flex items-center justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-green-600">${rma.totalValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Process Cash Refund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashRefundModal;