// frontend/src/components/rma/DestructionModal.jsx
// Modal for completing RMA destruction and reporting to Metrc

import React, { useState } from 'react';
import { AlertTriangle, Camera, Shield, Trash2, Package, Leaf, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DestructionModal = ({ rma, onClose, onComplete }) => {
  const [form, setForm] = useState({
    destructionMethod: 'incineration',
    destructionLocation: '',
    destructionWitnessName: '',
    destructionWitnessTitle: '',
    destructionNotes: '',
    destructionPhotos: []
  });
  const [loading, setLoading] = useState(false);

  // Calculate totals from RMA items
  const totalWeight = rma.items.reduce((sum, item) => 
    sum + ((item.weight || 0) * (item.quantity || 0)), 0
  );
  const totalTHC = rma.items.reduce((sum, item) => 
    sum + ((item.thcMg || 0) * (item.quantity || 0)), 0
  );
  const totalCBD = rma.items.reduce((sum, item) => 
    sum + ((item.cbdMg || 0) * (item.quantity || 0)), 0
  );

  // Count items with tracking IDs
  const itemsWithTracking = rma.items.filter(item => item.stateTrackingId).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.destructionWitnessName.trim()) {
      toast.error('Witness name is required for compliance');
      return;
    }

    if (!form.destructionLocation.trim()) {
      toast.error('Destruction location is required');
      return;
    }

    setLoading(true);
    try {
      await onComplete(form);
      toast.success('Destruction completed and reported to Metrc!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete destruction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Complete Destruction</h3>
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

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Compliance Required</p>
              <p className="text-xs text-yellow-700 mt-1">
                All destroyed cannabis products must be reported to Metrc within 24 hours.
                Ensure witness is present during destruction.
              </p>
            </div>
          </div>

          {/* Destruction Totals */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-red-600 font-medium">Total Weight</p>
                <p className="text-lg font-bold text-red-700">{totalWeight.toFixed(2)}g</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">Total THC</p>
                <p className="text-lg font-bold text-purple-700">{totalTHC.toFixed(2)} mg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Total CBD</p>
                <p className="text-lg font-bold text-blue-700">{totalCBD.toFixed(2)} mg</p>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Items to Destroy</h4>
            <div className="space-y-2">
              {rma.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    {item.stateTrackingId && (
                      <p className="text-xs text-gray-500">Tracking: {item.stateTrackingId}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{item.quantity} × {item.weight || 0}g</p>
                    <p className="text-xs text-gray-500">{((item.weight || 0) * item.quantity).toFixed(2)}g total</p>
                  </div>
                </div>
              ))}
            </div>
            {itemsWithTracking > 0 && (
              <p className="text-xs text-green-600 mt-3">
                ✓ {itemsWithTracking} item{itemsWithTracking !== 1 ? 's' : ''} will be reported to Metrc
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destruction Method *
              </label>
              <select
                value={form.destructionMethod}
                onChange={(e) => setForm({ ...form, destructionMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="incineration">Incineration</option>
                <option value="composting">Composting</option>
                <option value="grinding">Grinding with Waste</option>
                <option value="other">Other Method</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destruction Location *
              </label>
              <input
                type="text"
                value={form.destructionLocation}
                onChange={(e) => setForm({ ...form, destructionLocation: e.target.value })}
                placeholder="e.g., Main Facility - Waste Room A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Witness Name *
                </label>
                <input
                  type="text"
                  value={form.destructionWitnessName}
                  onChange={(e) => setForm({ ...form, destructionWitnessName: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Witness Title
                </label>
                <input
                  type="text"
                  value={form.destructionWitnessTitle}
                  onChange={(e) => setForm({ ...form, destructionWitnessTitle: e.target.value })}
                  placeholder="e.g., Compliance Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destruction Notes
              </label>
              <textarea
                value={form.destructionNotes}
                onChange={(e) => setForm({ ...form, destructionNotes: e.target.value })}
                rows={3}
                placeholder="Additional details about the destruction process..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Evidence (Recommended)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload photos</p>
                <p className="text-xs text-gray-500 mt-1">Recommended for compliance audit trail</p>
              </div>
            </div>

            {/* Metrc Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Metrc Reporting</p>
                <p className="text-xs text-blue-700 mt-1">
                  {itemsWithTracking > 0 ? (
                    <>This destruction will be automatically reported to Metrc. Package UIDs will be marked as waste.</>
                  ) : (
                    <>No tracking IDs found. This will be recorded internally but not reported to Metrc.</>
                  )}
                </p>
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Reporting to Metrc...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Complete Destruction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DestructionModal;