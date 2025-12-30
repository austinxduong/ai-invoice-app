import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Loader2, Edit, Printer, AlertCircle, Mail, ChevronDown, ChevronUp, Shield, Package, Leaf, Calendar, Building2, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateInvoice from './CreateInvoice';
import Button from '../../components/ui/Button';
import ReminderModal from '../../components/invoices/ReminderModal';

const InvoiceDetail = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState({}); // Track which items are expanded
    const invoiceRef = useRef();

    useEffect(() => {
      const fetchInvoice = async () => {
        try {
          const response = await axiosInstance.get(API_PATHS.INVOICE.GET_INVOICE_BY_ID(id));
          setInvoice(response.data);
        } catch (error) {
          toast.error('Failed to fetch invoice');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchInvoice();
    },[id])

    const handleUpdate = async (formData) => {
      try {
        const response = await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(id), formData);
        toast.success('Invoice updated succesfully');
        setIsEditing(false);
        setInvoice(response.data);
      } catch (error) {
        toast.error('Failed to update invoice');
        console.error(error);
      }
    };

    const handlePrint = () => {
      window.print();
    };

    const toggleItemExpansion = (index) => {
      setExpandedItems(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
        </div>
      )
    }

    if (!invoice) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Invoice not found</h3>
          <p className="text-slate-500 mb-6 max-w-md">The invoice you are looking for does not exist or could not be loaded.</p>
          <Button onClick={() => navigate('/invoices')}>Back to All Invoices</Button>
        </div>
      );
    }

    if (isEditing) {
      return <CreateInvoice existingInvoice={invoice} onSave={handleUpdate} />
    }

    // Calculate compliance totals
    const totalWeight = invoice.items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalTHC = invoice.items.reduce((sum, item) => sum + (item.thcMg || 0), 0);
    const totalCBD = invoice.items.reduce((sum, item) => sum + (item.cbdMg || 0), 0);

  return (
    <>
      <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} invoiceId={id} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4 sm:mb-0">
          Invoice <span className="font-mono text-slate-500">{invoice.invoiceNumber}</span>
        </h1>
        <div className="flex items-center gap-2">
          {invoice.status !== 'Paid' && (
            <Button variant="secondary" onClick={() => setIsReminderModalOpen(true)} icon={Mail}>Generate Reminder</Button>
          )}
          <Button variant="secondary" onClick={() => setIsEditing(true)} icon={Edit}>Edit</Button>
          <Button variant="primary" onClick={handlePrint} icon={Printer}>Print or Download</Button>
        </div>
      </div>

      <div id="invoice-content-wrapper">
        <div 
          ref={invoiceRef} 
          id="invoice-preview" 
          className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md border border-slate-200"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">INVOICE</h2>
              <p className="text-sm text-slate-500 mt-2"># {invoice.invoiceNumber}</p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <p className="text-sm text-slate-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 
                invoice.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Bill From/To Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill From</h3>
              {invoice.billFrom?.businessName && (
                <p className="font-semibold text-slate-800">{invoice.billFrom.businessName}</p>
              )}
              {invoice.billFrom?.name && (
                <p className="font-semibold text-slate-800">{invoice.billFrom.name}</p>
              )}
              {invoice.billFrom?.address && (
                <p className="text-slate-600">{invoice.billFrom.address}</p>
              )}
              {invoice.billFrom?.email && (
                <p className="text-slate-600">{invoice.billFrom.email}</p>
              )}
              {invoice.billFrom?.phone && (
                <p className="text-slate-600">{invoice.billFrom.phone}</p>
              )}
            </div>
            <div className="sm:text-right">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill To</h3>
              {invoice.billTo?.clientName && (
                <p className="font-semibold text-slate-800">{invoice.billTo.clientName}</p>
              )}
              {invoice.billTo?.address && (
                <p className="text-slate-600">{invoice.billTo.address}</p>
              )}
              {invoice.billTo?.email && (
                <p className="text-slate-600">{invoice.billTo.email}</p>
              )}
              {invoice.billTo?.phone && (
                <p className="text-slate-600">{invoice.billTo.phone}</p>
              )}
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 my-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Invoice Date</h3>
              <p className="font-medium text-slate-800">
                {invoice.localInvoiceDate || new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Due Date</h3>
              <p className="font-medium text-slate-800">
                {invoice.localDueDate || new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Terms</h3>
              <p className="font-medium text-slate-800">{invoice.paymentTerms}</p>
            </div>
          </div>

          {/* ✅ COMPLIANCE SUMMARY - NEW! */}
          {(totalWeight > 0 || totalTHC > 0 || totalCBD > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Total Weight</p>
                  <p className="text-lg font-bold text-green-700">{totalWeight.toFixed(2)}g</p>
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
          )}

          {/* ✅ ITEMS WITH INLINE COMPLIANCE - NEW! */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Line Items</h3>
            
            {invoice.items.map((item, index) => {
              const itemTotal = item.total || (item.quantity * item.unitPrice);
              const isExpanded = expandedItems[index];
              const hasComplianceData = item.batchNumber || item.thcContent || item.cbdContent || item.stateTrackingId;
              
              return (
                <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Main Item Row */}
                  <div className="bg-white p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {/* Product Name */}
                        <div className="sm:col-span-2">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.sku}</p>
                          {item.category && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        
                        {/* Quantity & Price */}
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Quantity</p>
                          <p className="font-medium text-slate-900">{item.quantity} {item.unit}</p>
                          <p className="text-xs text-slate-500 mt-1">${item.unitPrice.toFixed(2)} each</p>
                        </div>
                        
                        {/* Total */}
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-lg font-bold text-slate-900">${itemTotal.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      {hasComplianceData && (
                        <button
                          onClick={() => toggleItemExpansion(index)}
                          className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors print:hidden"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ COMPLIANCE DETAILS (Expandable) - NEW! */}
                  {hasComplianceData && (isExpanded || window.matchMedia('print').matches) && (
                    <div className="bg-slate-50 border-t border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-green-600" />
                        <h4 className="text-sm font-semibold text-slate-700">Cannabis Compliance Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {/* Batch & Tracking */}
                        {item.batchNumber && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Batch Number</p>
                            <p className="text-slate-900 font-mono">{item.batchNumber}</p>
                          </div>
                        )}
                        
                        {item.stateTrackingId && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">State Tracking ID</p>
                            <p className="text-slate-900 font-mono text-xs">{item.stateTrackingId}</p>
                          </div>
                        )}
                        
                        {/* THC/CBD */}
                        {(item.thcContent !== null && item.thcContent !== undefined) && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">THC Content</p>
                            <p className="text-slate-900">
                              {item.thcContent}%
                              {item.thcMg > 0 && <span className="text-slate-600 text-xs ml-1">({item.thcMg.toFixed(2)} mg)</span>}
                            </p>
                          </div>
                        )}
                        
                        {(item.cbdContent !== null && item.cbdContent !== undefined) && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">CBD Content</p>
                            <p className="text-slate-900">
                              {item.cbdContent}%
                              {item.cbdMg > 0 && <span className="text-slate-600 text-xs ml-1">({item.cbdMg.toFixed(2)} mg)</span>}
                            </p>
                          </div>
                        )}
                        
                        {/* Weight */}
                        {item.weight && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Weight</p>
                            <p className="text-slate-900">{item.weight}g</p>
                          </div>
                        )}
                        
                        {/* Dates */}
                        {item.localPackagedDate && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Packaged Date</p>
                            <p className="text-slate-900 text-xs">{item.localPackagedDate}</p>
                          </div>
                        )}
                        
                        {item.localHarvestDate && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Harvest Date</p>
                            <p className="text-slate-900 text-xs">{item.localHarvestDate}</p>
                          </div>
                        )}
                        
                        {item.localExpirationDate && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Expiration Date</p>
                            <p className="text-slate-900 text-xs">{item.localExpirationDate}</p>
                          </div>
                        )}
                        
                        {/* Lab Testing */}
                        {item.labTested && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Lab Test</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              item.labTestResult === 'pass' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.labTestResult?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Producer */}
                        {item.licensedProducer && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-slate-500 font-medium mb-1">Licensed Producer</p>
                            <p className="text-slate-900">{item.licensedProducer}</p>
                            {item.producerLicense && (
                              <p className="text-xs text-slate-600">License: {item.producerLicense}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Strain */}
                        {item.strainName && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Strain</p>
                            <p className="text-slate-900">
                              {item.strainName}
                              {item.strainType && <span className="text-slate-600 text-xs ml-1">({item.strainType})</span>}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>${invoice.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-slate-900 border-t border-slate-200 pt-3 mt-3">
                <span>Total</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {invoice.notes && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* State Reporting Badge */}
          {invoice.stateReported && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">State Reporting Complete</p>
                  {invoice.localUpdatedAt && (
                    <p className="text-xs text-green-700 mt-1">Reported: {invoice.localUpdatedAt}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @page {
            padding: 10px;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-content-wrapper, #invoice-content-wrapper * {
              visibility: visible;
            }
            #invoice-content-wrapper {
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              width: 100%;
            }
            #invoice-preview {
              box-shadow: none;
              border: none;
              border-radius: 0;
              padding: 0;
            }
            /* ✅ Show all compliance details when printing */
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default InvoiceDetail