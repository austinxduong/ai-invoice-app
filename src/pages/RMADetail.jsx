// frontend/src/pages/RMADetail.jsx
// frontend/src/pages/RMADetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, Package, 
  AlertTriangle, Edit, Trash2, DollarSign, FileText,
  Eye, RotateCcw, Upload, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const RMADetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rma, setRMA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  
  // Forms
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectionForm, setInspectionForm] = useState({
    inspectionResult: 'confirmed_defective',  // ✅ Match backend field name
    inspectionNotes: '',                      // ✅ Match backend field name
    inspectionPhotos: []                      // ✅ Match backend field name
  });
  const [resolutionForm, setResolutionForm] = useState({
    type: 'refund',
    refundAmount: 0,
    creditAmount: 0,
    creditMemoNumber: '',
    replacementOrderId: ''
  });

  useEffect(() => {
    fetchRMA();
  }, [id]);

  const fetchRMA = async () => {
    try {
      const response = await axiosInstance.get(`/rma/${id}`);
      setRMA(response.data.rma);
      
      // Set resolution form defaults
      if (response.data.rma) {
        setResolutionForm(prev => ({
          ...prev,
          refundAmount: response.data.rma.totalValue,
          creditAmount: response.data.rma.totalValue
        }));
      }
    } catch (error) {
      console.error('Error fetching RMA:', error);
      toast.error('Failed to load RMA details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this RMA?')) return;
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/rma/${id}/approve`);
      toast.success('RMA approved!');
      fetchRMA();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve RMA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/rma/${id}/reject`, { rejectionReason });
      toast.success('RMA rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchRMA();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject RMA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async () => {
    if (!window.confirm('Mark this RMA as received?')) return;
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/rma/${id}/receive`);
      toast.success('RMA marked as received!');
      fetchRMA();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark as received');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteInspection = async () => {
    if (!inspectionForm.inspectionNotes.trim()) {
      toast.error('Please provide inspection notes');
      return;
    }
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/rma/${id}/inspect`, inspectionForm);
      toast.success('Inspection completed!');
      setShowInspectionModal(false);
      fetchRMA();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/rma/${id}/resolve`, {
        resolutionType: resolutionForm.type,
        refundAmount: resolutionForm.refundAmount,
        creditAmount: resolutionForm.creditAmount,
        creditMemoNumber: resolutionForm.creditMemoNumber,
        replacementOrderId: resolutionForm.replacementOrderId
      });
      toast.success('RMA resolved!');
      setShowResolutionModal(false);
      fetchRMA();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resolve RMA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Close this RMA? This action cannot be undone.')) return;
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/rma/${id}/close`);
      toast.success('RMA closed!');
      fetchRMA();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to close RMA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this RMA? This cannot be undone.')) return;
    
    setActionLoading(true);
    try {
      await axiosInstance.delete(`/rma/${id}`);
      toast.success('RMA deleted');
      navigate('/rma');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete RMA');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_approval': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'approved': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'received': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      'inspecting': { bg: 'bg-orange-100', text: 'text-orange-800', icon: Eye },
      'inspected': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: CheckCircle },
      'resolved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'closed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig['pending_approval'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const canApprove = user?.permissions?.canManageInvoices && rma?.status === 'pending_approval';
  const canReceive = rma?.status === 'approved';
  const canInspect = user?.permissions?.canManageProducts && (rma?.status === 'received' || rma?.status === 'inspecting');
  const canResolve = user?.permissions?.canManageInvoices && rma?.status === 'inspected';
  const canClose = user?.permissions?.canManageInvoices && rma?.status === 'resolved';
  const canDelete = (rma?.status === 'pending_approval' || user?.isOwner);
  const canEdit = !['resolved', 'closed', 'rejected'].includes(rma?.status); // ✅ Can edit until resolved

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RMA details...</p>
        </div>
      </div>
    );
  }

  if (!rma) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">RMA Not Found</h2>
        <p className="text-gray-600 mb-4">The RMA you're looking for doesn't exist.</p>
        <Link to="/rma" className="text-green-600 hover:text-green-800">
          Back to RMA Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/rma')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RMAs
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <RotateCcw className="w-7 h-7 text-green-600" />
              {rma.rmaNumber}
            </h1>
            <div className="flex items-center gap-3">
              {getStatusBadge(rma.status)}
              <span className="text-sm text-gray-600">
                Created {new Date(rma.createdAt).toLocaleDateString()} by {rma.createdBy?.firstName} {rma.createdBy?.lastName}
              </span>
              {rma.lastModifiedBy && rma.updatedAt !== rma.createdAt && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  ✏️ Last edited {new Date(rma.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                to={`/rma/edit/${id}`}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            )}
            
            {canApprove && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            
            {canReceive && (
              <button
                onClick={handleMarkReceived}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Mark Received
              </button>
            )}
            
            {canInspect && (
              <button
                onClick={() => setShowInspectionModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Complete Inspection
              </button>
            )}
            
            {canResolve && (
              <button
                onClick={() => setShowResolutionModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </button>
            )}
            
            {canClose && (
              <button
                onClick={handleClose}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Close RMA
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
        
        <div className="space-y-4">
          {/* Created */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">RMA Created</p>
              <p className="text-sm text-gray-600">
                {new Date(rma.createdAt).toLocaleString()} by {rma.createdBy?.firstName} {rma.createdBy?.lastName}
              </p>
            </div>
          </div>

          {/* Approved/Rejected */}
          {rma.approvedAt && (
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${rma.status === 'rejected' ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
                {rma.status === 'rejected' ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {rma.status === 'rejected' ? 'Rejected' : 'Approved'}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(rma.approvedAt).toLocaleString()} by {rma.approvedBy?.firstName} {rma.approvedBy?.lastName}
                </p>
                {rma.rejectionReason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {rma.rejectionReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Received */}
          {rma.receivedAt && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Product Received</p>
                <p className="text-sm text-gray-600">
                  {new Date(rma.receivedAt).toLocaleString()} by {rma.receivedBy?.firstName} {rma.receivedBy?.lastName}
                </p>
              </div>
            </div>
          )}

          {/* Inspected */}
          {rma.inspectionDate && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Inspection Completed</p>
                <p className="text-sm text-gray-600">
                  {new Date(rma.inspectionDate).toLocaleString()} by {rma.inspectedBy?.firstName} {rma.inspectedBy?.lastName}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Result: <span className="font-medium">{rma.inspectionResult?.replace(/_/g, ' ')}</span>
                </p>
                {rma.inspectionNotes && (
                  <p className="text-sm text-gray-600 mt-1">Notes: {rma.inspectionNotes}</p>
                )}
              </div>
            </div>
          )}

          {/* Resolved */}
          {rma.resolutionDate && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Resolved - {rma.resolutionType?.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-sm text-gray-600">
                  {new Date(rma.resolutionDate).toLocaleString()}
                </p>
                {rma.resolutionType === 'refund' && (
                  <p className="text-sm text-gray-700 mt-1">Refund Amount: ${rma.refundAmount?.toFixed(2)}</p>
                )}
                {rma.resolutionType === 'store_credit' && (
                  <p className="text-sm text-gray-700 mt-1">
                    Credit: ${rma.creditAmount?.toFixed(2)} ({rma.creditMemoNumber})
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Closed */}
          {rma.closedAt && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">RMA Closed</p>
                <p className="text-sm text-gray-600">
                  {new Date(rma.closedAt).toLocaleString()} by {rma.closedBy?.firstName} {rma.closedBy?.lastName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-600">Customer Name</dt>
              <dd className="text-sm text-gray-900">{rma.customerName}</dd>
            </div>
            {rma.customerEmail && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Email</dt>
                <dd className="text-sm text-gray-900">{rma.customerEmail}</dd>
              </div>
            )}
            {rma.customerPhone && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Phone</dt>
                <dd className="text-sm text-gray-900">{rma.customerPhone}</dd>
              </div>
            )}
            {rma.invoiceNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Invoice Number</dt>
                <dd className="text-sm text-gray-900">{rma.invoiceNumber}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Return Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-600">Return Type</dt>
              <dd className="text-sm text-gray-900 capitalize">{rma.type?.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Primary Reason</dt>
              <dd className="text-sm text-gray-900 capitalize">{rma.returnReason?.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Detailed Explanation</dt>
              <dd className="text-sm text-gray-900">{rma.detailedReason}</dd>
            </div>
            {rma.customerComplaint && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Customer Complaint</dt>
                <dd className="text-sm text-gray-900">{rma.customerComplaint}</dd>
              </div>
            )}
            {rma.internalNotes && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Internal Notes</dt>
                <dd className="text-sm text-gray-900 italic">{rma.internalNotes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Items Being Returned */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Being Returned</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rma.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.sku || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 capitalize">{item.condition?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">${item.totalValue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.reason}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan="5" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total Return Value:</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">${rma.totalValue.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Photos */}
      {rma.inspectionPhotos && rma.inspectionPhotos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inspection Photos</h2>
          <div className="grid grid-cols-3 gap-4">
            {rma.inspectionPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Inspection ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject RMA</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Why is this RMA being rejected?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject RMA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Inspection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Result *
                </label>
                <select
                  value={inspectionForm.inspectionResult}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionResult: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="confirmed_defective">Confirmed Defective</option>
                  <option value="customer_error">Customer Error</option>
                  <option value="acceptable">Acceptable Condition</option>
                  <option value="partial_defect">Partial Defect</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Notes *
                </label>
                <textarea
                  value={inspectionForm.inspectionNotes}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionNotes: e.target.value })}
                  rows={3}
                  placeholder="Detailed inspection findings..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteInspection}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Complete Inspection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve RMA</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Type *
                </label>
                <select
                  value={resolutionForm.type}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="refund">Refund</option>
                  <option value="replacement">Replacement</option>
                  <option value="store_credit">Store Credit</option>
                  <option value="reject">Reject Claim</option>
                </select>
              </div>

              {resolutionForm.type === 'refund' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    value={resolutionForm.refundAmount}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, refundAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {resolutionForm.type === 'store_credit' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Amount
                    </label>
                    <input
                      type="number"
                      value={resolutionForm.creditAmount}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, creditAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Memo Number
                    </label>
                    <input
                      type="text"
                      value={resolutionForm.creditMemoNumber}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, creditMemoNumber: e.target.value })}
                      placeholder="CM-2025-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              )}

              {resolutionForm.type === 'replacement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Replacement Order ID
                  </label>
                  <input
                    type="text"
                    value={resolutionForm.replacementOrderId}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, replacementOrderId: e.target.value })}
                    placeholder="INV-2025-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Resolving...' : 'Resolve RMA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RMADetail;