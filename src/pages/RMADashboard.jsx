// frontend/src/pages/RMADashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { 
  RotateCcw, Plus, Filter, Download, 
  Clock, CheckCircle, XCircle, AlertTriangle,
  DollarSign, Package, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const RMADashboard = () => {
  const [rmas, setRMAs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchRMAs();
    fetchStats();
  }, [filterStatus]);

  const fetchRMAs = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      
      const response = await axiosInstance.get('/rma', { params });
      setRMAs(response.data.rmas || []);
    } catch (error) {
      console.error('Error fetching RMAs:', error);
      toast.error('Failed to load RMAs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/rma/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_approval': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'approved': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'received': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      'inspecting': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
      'inspected': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: CheckCircle },
      'resolved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'closed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig['pending_approval'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getReasonBadge = (reason) => {
    const reasonColors = {
      'quality_issue': 'bg-red-50 text-red-700 border-red-200',
      'wrong_product': 'bg-orange-50 text-orange-700 border-orange-200',
      'damaged': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'expired': 'bg-purple-50 text-purple-700 border-purple-200',
      'recall': 'bg-red-50 text-red-700 border-red-200',
      'customer_error': 'bg-blue-50 text-blue-700 border-blue-200',
      'supplier_defect': 'bg-pink-50 text-pink-700 border-pink-200',
      'other': 'bg-gray-50 text-gray-700 border-gray-200',
    };

    const colorClass = reasonColors[reason] || reasonColors['other'];

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
        {reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RMAs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <RotateCcw className="w-7 h-7 text-green-600" />
              RMA Management
            </h1>
            <p className="text-gray-600">Track and manage product returns and defects</p>
          </div>
          <Link
            to="/rma/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New RMA
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.statusCounts?.pending_approval || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active RMAs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(stats.statusCounts?.approved || 0) + 
                   (stats.statusCounts?.received || 0) + 
                   (stats.statusCounts?.inspected || 0)}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved (30d)</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.last30Days?.count || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value (30d)</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${(stats.last30Days?.totalValue || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="inspecting">Inspecting</option>
            <option value="inspected">Inspected</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* RMAs List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            All RMAs ({rmas.length})
          </h2>
        </div>

        {rmas.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">No RMAs Found</p>
            <p className="text-sm text-gray-600 mb-4">
              {filterStatus ? 'No RMAs match the selected filter' : 'Create your first RMA to get started'}
            </p>
            {!filterStatus && (
              <Link
                to="/rma/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Create RMA
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    RMA Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rmas.map((rma) => (
                  <tr key={rma._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/rma/${rma._id}`}
                        className="text-sm font-medium text-green-600 hover:text-green-900"
                      >
                        {rma.rmaNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rma.customerName}
                      </div>
                      {rma.invoiceNumber && (
                        <div className="text-xs text-gray-500">
                          Invoice: {rma.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rma.items.length} item{rma.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rma.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getReasonBadge(rma.returnReason)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${rma.totalValue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rma.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(rma.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rma.createdBy?.firstName} {rma.createdBy?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/rma/${rma._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RMADashboard;