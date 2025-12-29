// frontend/src/pages/EditRMA.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EditRMA = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rma, setRMA] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    returnReason: 'quality_issue',
    detailedReason: '',
    customerComplaint: '',
    internalNotes: '',
    items: []
  });

  useEffect(() => {
    fetchRMA();
  }, [id]);

  const fetchRMA = async () => {
    try {
      const response = await axiosInstance.get(`/rma/${id}`);
      const rmaData = response.data.rma;
      
      // ✅ UPDATED: Check if RMA can be edited
      const canEdit = !['resolved', 'closed', 'rejected'].includes(rmaData.status);
      
      if (!canEdit) {
        toast.error('Cannot edit RMA after it has been resolved, closed, or rejected');
        navigate(`/rma/${id}`);
        return;
      }
      
      setRMA(rmaData);
      setFormData({
        customerName: rmaData.customerName || '',
        customerEmail: rmaData.customerEmail || '',
        customerPhone: rmaData.customerPhone || '',
        returnReason: rmaData.returnReason || 'quality_issue',
        detailedReason: rmaData.detailedReason || '',
        customerComplaint: rmaData.customerComplaint || '',
        internalNotes: rmaData.internalNotes || '',
        items: rmaData.items || []
      });
    } catch (error) {
      console.error('Error fetching RMA:', error);
      toast.error('Failed to load RMA');
      navigate('/rma');
    } finally {
      setLoading(false);
    }
  };

  const updateItemField = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Recalculate total if quantity changes
    if (field === 'quantity') {
      newItems[index].totalValue = parseInt(value) * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.detailedReason.trim()) {
      toast.error('Detailed reason is required');
      return;
    }
    
    const activeItems = formData.items.filter(item => item.quantity > 0);
    if (activeItems.length === 0) {
      toast.error('At least one item must have quantity > 0');
      return;
    }
    
    setSaving(true);
    
    try {
      await axiosInstance.put(`/rma/${id}`, formData);
      toast.success('RMA updated successfully!');
      navigate(`/rma/${id}`);
    } catch (error) {
      console.error('Error updating RMA:', error);
      toast.error(error.response?.data?.error || 'Failed to update RMA');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RMA...</p>
        </div>
      </div>
    );
  }

  if (!rma) {
    return null;
  }

  const totalValue = formData.items.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/rma/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RMA Details
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit RMA: {rma.rmaNumber}</h1>
        <p className="text-gray-600">Make changes to this pending RMA</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Return Reason *
              </label>
              <select
                value={formData.returnReason}
                onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="quality_issue">Quality Issue (Mold, Contamination)</option>
                <option value="wrong_product">Wrong Product</option>
                <option value="damaged">Damaged Packaging</option>
                <option value="expired">Expired Product</option>
                <option value="recall">Regulatory Recall</option>
                <option value="customer_error">Customer Changed Mind</option>
                <option value="supplier_defect">Supplier Defect</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Explanation *
              </label>
              <textarea
                value={formData.detailedReason}
                onChange={(e) => setFormData({ ...formData, detailedReason: e.target.value })}
                rows={3}
                placeholder="Provide a detailed explanation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Complaint
              </label>
              <textarea
                value={formData.customerComplaint}
                onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
                rows={2}
                placeholder="What did the customer say?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes
              </label>
              <textarea
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                rows={2}
                placeholder="Internal notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Being Returned</h2>
          
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{item.productName}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItemField(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={item.condition}
                      onChange={(e) => updateItemField(index, 'condition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="defective">Defective</option>
                      <option value="damaged">Damaged</option>
                      <option value="unopened">Unopened</option>
                      <option value="expired">Expired</option>
                      <option value="wrong_product">Wrong Product</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Value
                    </label>
                    <input
                      type="text"
                      value={`$${item.totalValue.toFixed(2)}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Return
                  </label>
                  <input
                    type="text"
                    value={item.reason}
                    onChange={(e) => updateItemField(index, 'reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Total Return Value:</span>
              <span className="text-2xl font-bold text-blue-900">${totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/rma/${id}`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRMA;