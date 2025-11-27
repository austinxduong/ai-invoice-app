import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from '../../utils/apiPaths'
import { Loader2, Trash2, Edit, Search, FileText, Plus, AlertCircle, Sparkles, Mail } from "lucide-react";
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button'
import CreateWithAiModal from '../../components/invoices/CreateWithAiModal';
import ReminderModal from '../../components/invoices/ReminderModal';


const AllInvoices = () => {

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
      const response = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
      console.log("Invoices fetched:", response.data);

      // Check if response.data is an array (success) or error object
      if (Array.isArray(response.data)) {
          setInvoices(response.data.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)));
      } else {
          console.error("Expected array but got:", response.data);
          setInvoices([]); // Set empty array as fallback
      }
      } catch (err) {
        setError('Failed to fetch invoices.');
        console.error(err)
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {

  };

  const handleStatusChange = async (invoice) => {

  };

  const handleOpenReminderModal = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(invoice => statusFilter === 'All' || invoice.status === statusFilter)
      .filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.billTo.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [invoices, searchTerm, statusFilter]);

  if (loading) {
    return <div className="flex justify-center itw-8 h-8 animate-spin text-blue-600"><Loader2 className="" /></div>
  }

  return (
    <div className="space-y-6">
      <CreateWithAiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)}/>
      <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} invoiceId={selectedInvoiceId}/>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Invoices</h1>
          <p className="text-sm text-slate-600 mt-1">Manage all your invoices in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsAiModalOpen(true)} icon={Sparkles}>Create with AI</Button>
          <Button onClick={() => navigate('/invoices/new')} icon={Plus}>
            Create Invoice
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font font-medium text-red-800 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

        <div className="bg-white border-slate-200 rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by invoice # or client..."
                  className="w-full h-10 pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <select
                  className="w-full sm:w-auto h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

            </div>

          </div>



          </div>
      </div>
  )
}

export default AllInvoices