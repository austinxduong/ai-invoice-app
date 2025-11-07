import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from '../../utils/apiPaths'
import { Loader2, Trash2, Edit, Search, FileText, Plus, AlertCircle, Sparkles, Mail } from lucide-react;
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

  return (
    <div>AllInvoices</div>
  )
}

export default AllInvoices