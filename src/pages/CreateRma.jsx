// frontend/src/pages/CreateRMA.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { 
  ArrowLeft, Search, Plus, Trash2, Upload, X,
  AlertCircle, CheckCircle, Package, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateRMA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preSelectedInvoiceId = searchParams.get('invoiceId');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Invoice Selection
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Step 2: Product Selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Step 3: Details
  const [rmaData, setRMAData] = useState({
    type: 'customer_return',
    returnReason: 'quality_issue',
    detailedReason: '',
    customerComplaint: '',
    internalNotes: '',
    regulatoryNotificationRequired: false
  });
  
  // Photos
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (preSelectedInvoiceId && invoices.length > 0) {
      const invoice = invoices.find(inv => inv._id === preSelectedInvoiceId);
      if (invoice) {
        handleSelectInvoice(invoice);
      }
    }
  }, [preSelectedInvoiceId, invoices]);

  const fetchInvoices = async () => {
    try {
      console.log('🔍 Fetching invoices...');
      const response = await axiosInstance.get('/invoices');
      console.log('📦 Invoice response:', response.data);
      
      // Handle different response formats
      const invoiceList = response.data.invoices || response.data.data || response.data || [];
      console.log('✅ Invoices loaded:', invoiceList.length);
      console.log('📋 First invoice:', invoiceList[0]);
      
      setInvoices(invoiceList);
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load invoices');
    }
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    // Pre-populate products from invoice
    const products = invoice.items.map(item => ({
      productId: item.productId,
      productName: item.name || item.description,
      sku: item.sku || '',
      batchNumber: item.batchNumber || '',
      availableQuantity: item.quantity,
      quantity: 0,
      unitPrice: item.unitPrice || item.price,
      totalValue: 0,
      reason: '',
      condition: 'defective'
    }));
    setSelectedProducts(products);
    setStep(2);
  };

  const updateProductQuantity = (index, quantity) => {
    const newProducts = [...selectedProducts];
    const qty = Math.min(parseInt(quantity) || 0, newProducts[index].availableQuantity);
    newProducts[index].quantity = qty;
    newProducts[index].totalValue = qty * newProducts[index].unitPrice;
    setSelectedProducts(newProducts);
  };

  const updateProductField = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;
    setSelectedProducts(newProducts);
  };

  const removeProduct = (index) => {
    const newProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(newProducts);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Max 5MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          name: file.name,
          data: reader.result,
          preview: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Check if products selected
    const activeProducts = selectedProducts.filter(p => p.quantity > 0);
    if (activeProducts.length === 0) {
      toast.error('Please select at least one product to return');
      return false;
    }

    // Check if all selected products have reasons
    for (const product of activeProducts) {
      if (!product.reason.trim()) {
        toast.error(`Please provide a reason for ${product.productName}`);
        return false;
      }
    }

    // Check detailed reason
    if (!rmaData.detailedReason.trim()) {
      toast.error('Please provide a detailed explanation');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Filter only products with quantity > 0
      const itemsToReturn = selectedProducts
        .filter(p => p.quantity > 0)
        .map(p => ({
          productId: p.productId,
          productName: p.productName,
          sku: p.sku,
          batchNumber: p.batchNumber,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalValue: p.totalValue,
          reason: p.reason,
          condition: p.condition
        }));

      const rmaPayload = {
        type: rmaData.type,
        relatedInvoiceId: selectedInvoice._id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerId: selectedInvoice.customerId,
        customerName: selectedInvoice.billTo?.name || selectedInvoice.customerName || 'Unknown Customer',
        customerEmail: selectedInvoice.billTo?.email || '',
        customerPhone: selectedInvoice.billTo?.phone || '',
        items: itemsToReturn,
        returnReason: rmaData.returnReason,
        detailedReason: rmaData.detailedReason,
        customerComplaint: rmaData.customerComplaint,
        internalNotes: rmaData.internalNotes,
        regulatoryNotificationRequired: rmaData.regulatoryNotificationRequired,
        attachments: photos.map(p => p.data) // Base64 encoded photos
      };

      const response = await axiosInstance.post('/rma', rmaPayload);

      toast.success('RMA created successfully!');
      navigate(`/rma/${response.data.rma._id}`);

    } catch (error) {
      console.error('Create RMA error:', error);
      toast.error(error.response?.data?.error || 'Failed to create RMA');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    
    // Check invoice number (multiple possible field names)
    const invoiceNum = (invoice.invoiceNumber || invoice.number || invoice.invoiceNo || '').toLowerCase();
    
    // Check customer name (multiple possible locations)
    const customerName = (
      invoice.customerName || 
      invoice.billTo?.name || 
      invoice.billTo?.businessName ||
      invoice.customer?.name ||
      ''
    ).toLowerCase();
    
    const matchesSearch = invoiceNum.includes(searchLower) || customerName.includes(searchLower);
    
    console.log('🔍 Filtering invoice:', {
      invoiceNumber: invoiceNum,
      customerName,
      searchTerm: searchLower,
      matches: matchesSearch
    });
    
    return matchesSearch;
  });

  const totalReturnValue = selectedProducts.reduce((sum, p) => sum + p.totalValue, 0);
  const totalReturnItems = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/rma')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RMAs
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Return (RMA)</h1>
        <p className="text-gray-600">Process a product return or defect claim</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Invoice</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Select Products</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }}></div>
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Details & Submit</span>
          </div>
        </div>
      </div>

      {/* Step 1: Invoice Selection */}
      {step === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Invoice or Transaction</h2>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No invoices found</p>
              </div>
            ) : (
              filteredInvoices.map(invoice => (
                <div
                  key={invoice._id}
                  onClick={() => handleSelectInvoice(invoice)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-green-50 hover:border-green-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.billTo?.name || invoice.customerName || 'Unknown Customer'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.date || invoice.createdAt).toLocaleDateString()} • {invoice.items?.length || 0} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${invoice.total?.toFixed(2) || '0.00'}
                      </div>
                      <div className={`text-xs ${invoice.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {invoice.status || 'pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 2: Product Selection */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Selected Invoice Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Selected Invoice:</p>
                <p className="font-medium text-green-900">{selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-green-700">{selectedInvoice.billTo?.name || selectedInvoice.customerName}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Change Invoice
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Products to Return</h2>
            
            <div className="space-y-4">
              {selectedProducts.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.productName}</h3>
                      {product.sku && (
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Available: {product.availableQuantity} units @ ${product.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    {product.quantity > 0 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={product.availableQuantity}
                        value={product.quantity}
                        onChange={(e) => updateProductQuantity(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition *
                      </label>
                      <select
                        value={product.condition}
                        onChange={(e) => updateProductField(index, 'condition', e.target.value)}
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
                        value={`$${product.totalValue.toFixed(2)}`}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  {product.quantity > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Return *
                      </label>
                      <input
                        type="text"
                        value={product.reason}
                        onChange={(e) => updateProductField(index, 'reason', e.target.value)}
                        placeholder="e.g., Mold detected, packaging damaged, wrong strain"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            {totalReturnItems > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Total Return Value:</p>
                    <p className="text-2xl font-bold text-blue-900">${totalReturnValue.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">{totalReturnItems} items selected</p>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            )}

            {totalReturnItems === 0 && (
              <div className="mt-6 text-center text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Please select at least one product to return</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Details & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Returning from:</p>
                <p className="font-medium text-green-900">{selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-green-700">{totalReturnItems} items • ${totalReturnValue.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Edit Products
              </button>
            </div>
          </div>

          {/* Return Details Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h2>

            {/* Return Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Type *
              </label>
              <select
                value={rmaData.type}
                onChange={(e) => setRMAData({ ...rmaData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="customer_return">Customer Return</option>
                <option value="supplier_return">Supplier Return</option>
                <option value="internal_damage">Internal Damage</option>
                <option value="recall">Product Recall</option>
              </select>
            </div>

            {/* Return Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Return Reason *
              </label>
              <select
                value={rmaData.returnReason}
                onChange={(e) => setRMAData({ ...rmaData, returnReason: e.target.value })}
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

            {/* Detailed Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Explanation *
              </label>
              <textarea
                value={rmaData.detailedReason}
                onChange={(e) => setRMAData({ ...rmaData, detailedReason: e.target.value })}
                rows={3}
                placeholder="Provide a detailed explanation of the issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Customer Complaint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Complaint (if applicable)
              </label>
              <textarea
                value={rmaData.customerComplaint}
                onChange={(e) => setRMAData({ ...rmaData, customerComplaint: e.target.value })}
                rows={2}
                placeholder="What did the customer say?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes (not visible to customer)
              </label>
              <textarea
                value={rmaData.internalNotes}
                onChange={(e) => setRMAData({ ...rmaData, internalNotes: e.target.value })}
                rows={2}
                placeholder="Internal notes for your team..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Regulatory Notification */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="regulatory"
                checked={rmaData.regulatoryNotificationRequired}
                onChange={(e) => setRMAData({ ...rmaData, regulatoryNotificationRequired: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="regulatory" className="text-sm text-gray-700">
                Requires regulatory notification (state tracking system)
              </label>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos (Optional)</h2>
            
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload photos</p>
                  <p className="text-xs text-gray-500">Max 5MB per file</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo.preview}
                      alt={photo.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating RMA...
                  </span>
                ) : (
                  'Submit RMA'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRMA;