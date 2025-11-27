import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from '../../utils/apiPaths'
import { Loader2, Trash2, Edit, Search, FileText, Plus, AlertCircle, Sparkles, Mail } from "lucide-react";
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button'

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
    <div>AllInvoices</div>
  )
}

export default AllInvoices