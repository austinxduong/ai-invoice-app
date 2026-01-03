import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, Check } from 'lucide-react';
import { usePOSTransaction } from '../context/POSTransaction';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const ReceiptModal = ({ onClose, transaction = null }) => {
  const { completedTransactions, totals } = usePOSTransaction();
  const { user } = useAuth();
  const receiptRef = useRef();
  const [orgSettings, setOrgSettings] = useState(null);

  const receiptTransaction = transaction || completedTransactions[completedTransactions.length - 1];

  useEffect(() => {
    // Fetch organization settings for facility info
    const fetchOrgSettings = async () => {
      try {
        const response = await axiosInstance.get('/organization/settings');
        setOrgSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch org settings:', error);
      }
    };
    fetchOrgSettings();
  }, []);

  if (!receiptTransaction) {
    setTimeout(() => onClose(), 0);
    return null;
  }

  const getTransactionId = () => {
    return receiptTransaction.transactionId || receiptTransaction.id || receiptTransaction._id || 'N/A';
  };

  const getTransactionTimestamp = () => {
    return receiptTransaction.createdAt || receiptTransaction.timestamp || new Date();
  };

  const getPaymentMethod = () => {
    const method = receiptTransaction.paymentMethod || 'cash';
    if (method === 'cash+credit') {
      return 'CASH + STORE CREDIT';
    }
    return method.toUpperCase();
  };

  const getTotals = () => {
    return receiptTransaction.totals || {};
  };

  const getItems = () => {
    return receiptTransaction.items || [];
  };

  const getReceiptData = () => {
    return receiptTransaction.receiptData || {};
  };

  const getCreditApplied = () => {
    return getTotals().creditApplied || getReceiptData().creditApplied || 0;
  };

  const getAppliedCredits = () => {
    return getReceiptData().appliedCredits || [];
  };

  const getFinalTotal = () => {
    return getTotals().finalTotal || getTotals().grandTotal || 0;
  };

  const getCashReceived = () => {
    return receiptTransaction.cashReceived || 
           getReceiptData().cashReceived || 
           getTotals().cashReceived || 
           0;
  };

  // Get facility info from org settings
  const getFacilityName = () => {
    return orgSettings?.location?.facilityName || 'CANNABIS DISPENSARY';
  };

  const getFacilityAddress = () => {
    if (!orgSettings?.location) return '123 Main Street';
    return orgSettings.location.address || '123 Main Street';
  };

  const getFacilityCity = () => {
    if (!orgSettings?.location) return 'Cannabis City, CC 12345';
    const { city, state, zip } = orgSettings.location;
    return `${city || 'Cannabis City'}, ${state || 'CC'} ${zip || '12345'}`;
  };

  const getFacilityPhone = () => {
    return orgSettings?.location?.phone || '(555) 123-4567';
  };

  const getFacilityLicense = () => {
    return orgSettings?.location?.licenseNumber || 'ABC123456';
  };

  // Get cashier name
  const getCashierName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Store Associate';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = generateReceiptText();
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${getTransactionId()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateReceiptText = () => {
    const divider = '========================================';
    const creditApplied = getCreditApplied();
    const appliedCredits = getAppliedCredits();
    
    return `
${divider}
           ${getFacilityName()}
${divider}

${getFacilityAddress()}
${getFacilityCity()}
Phone: ${getFacilityPhone()}
License #: ${getFacilityLicense()}

Transaction ID: ${getTransactionId()}
Date: ${formatDate(getTransactionTimestamp())}
Cashier: ${getCashierName()}

${divider}
ITEMS PURCHASED
${divider}

${getItems().map(item => `
${item.name}
SKU: ${item.sku} | ${item.pricingOption?.weight}g
Qty: ${item.quantity} x ${formatCurrency(item.pricingOption?.price || 0)}
${item.cannabis?.thc ? `THC: ${item.cannabis.thc}% ` : ''}${item.cannabis?.cbd ? `CBD: ${item.cannabis.cbd}%` : ''}
${item.cannabis?.batchNumber ? `Batch: ${item.cannabis.batchNumber}` : ''}
Subtotal: ${formatCurrency((item.pricingOption?.price || 0) * item.quantity)}
`).join('')}

${divider}
PAYMENT SUMMARY
${divider}

Subtotal: ${formatCurrency(getTotals().subtotal || 0)}
${getTotals().discountAmount > 0 ? `Discount: -${formatCurrency(getTotals().discountAmount)}\n` : ''}
${getTotals().taxBreakdown ? `
Cultivation Tax: ${formatCurrency(getTotals().taxBreakdown.cultivation || 0)}
Excise Tax: ${formatCurrency(getTotals().taxBreakdown.excise || 0)}
State Sales Tax: ${formatCurrency(getTotals().taxBreakdown.sales?.state || 0)}
County Sales Tax: ${formatCurrency(getTotals().taxBreakdown.sales?.county || 0)}
City Sales Tax: ${formatCurrency(getTotals().taxBreakdown.sales?.city || 0)}
` : ''}
Total Tax: ${formatCurrency(getTotals().taxAmount || 0)}

TOTAL: ${formatCurrency(getTotals().grandTotal || 0)}

${creditApplied > 0 ? `
Store Credit Applied: -${formatCurrency(creditApplied)}
${appliedCredits.length > 0 ? appliedCredits.map(c => `  ${c.memoNumber}: -${formatCurrency(c.amount)}`).join('\n') : ''}

Amount Due: ${formatCurrency(getFinalTotal())}
` : ''}

Payment Method: ${getPaymentMethod()}
Cash Received: ${formatCurrency(getCashReceived())}
${getTotals().changeAmount > 0 ? `Change Given: ${formatCurrency(getTotals().changeAmount)}` : ''}

${divider}
IMPORTANT CANNABIS NOTICE
${divider}

This product has not been analyzed or 
approved by the FDA. Keep out of reach 
of children and pets. For use only by 
adults 21 years of age or older.

${divider}
Thank you for your business!
Visit us again soon!
${divider}
    `.trim();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
          
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Receipt</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div ref={receiptRef} className="p-6" style={{ fontFamily: 'monospace' }}>
            
            {/* Business Header - Dynamic */}
            <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
              <h3 className="text-lg font-bold">{getFacilityName()}</h3>
              <p className="text-sm text-gray-600">{getFacilityAddress()}</p>
              <p className="text-sm text-gray-600">{getFacilityCity()}</p>
              <p className="text-sm text-gray-600">Phone: {getFacilityPhone()}</p>
              <p className="text-sm text-gray-600 mt-2">License #: {getFacilityLicense()}</p>
            </div>

            {/* Transaction Info - Dynamic Cashier */}
            <div className="mb-6 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-medium">{getTransactionId()}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-medium">{formatDate(getTransactionTimestamp())}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span className="font-medium">{getCashierName()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">{getPaymentMethod()}</span>
              </div>
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <div className="border-b border-gray-300 pb-2 mb-3">
                <h4 className="font-bold text-sm">ITEMS PURCHASED</h4>
              </div>
              
              <div className="space-y-4">
                {getItems().map((item, index) => (
                  <div key={index} className="text-xs space-y-1">
                    <div className="font-medium">{item.name}</div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>SKU: {item.sku}</span>
                      <span>{item.pricingOption?.weight}g</span>
                    </div>
                    
                    {item.cannabis && (
                      <div className="text-gray-600">
                        {item.cannabis.thc > 0 && `THC: ${item.cannabis.thc}% `}
                        {item.cannabis.cbd > 0 && `CBD: ${item.cannabis.cbd}% `}
                        {item.subcategory && `(${item.subcategory})`}
                      </div>
                    )}
                    
                    {item.cannabis?.batchNumber && (
                      <div className="text-gray-600">
                        Batch: {item.cannabis.batchNumber}
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Qty: {item.quantity} x {formatCurrency(item.pricingOption?.price || 0)}</span>
                      <span className="font-medium">
                        {formatCurrency((item.pricingOption?.price || 0) * item.quantity)}
                      </span>
                    </div>
                    
                    {index < getItems().length - 1 && (
                      <div className="border-b border-gray-200 pt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(getTotals().subtotal || 0)}</span>
                </div>
                
                {getTotals().taxBreakdown && (
                  <div className="space-y-1 text-xs border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cultivation Tax</span>
                      <span>{formatCurrency(getTotals().taxBreakdown.cultivation || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Excise Tax</span>
                      <span>{formatCurrency(getTotals().taxBreakdown.excise || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State Sales Tax</span>
                      <span>{formatCurrency(getTotals().taxBreakdown.sales?.state || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">County Sales Tax</span>
                      <span>{formatCurrency(getTotals().taxBreakdown.sales?.county || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City Sales Tax</span>
                      <span>{formatCurrency(getTotals().taxBreakdown.sales?.city || 0)}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between font-medium">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(getTotals().taxAmount || 0)}</span>
                </div>
                
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(getTotals().grandTotal || 0)}</span>
                  </div>
                </div>

                {getCreditApplied() > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Store Credit Applied:</span>
                        <span>-{formatCurrency(getCreditApplied())}</span>
                      </div>
                      {getAppliedCredits().length > 0 && (
                        <div className="text-xs text-gray-600 mt-1 ml-4 space-y-1">
                          {getAppliedCredits().map((credit, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{credit.memoNumber}:</span>
                              <span>-${credit.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-400 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Amount Due:</span>
                        <span>{formatCurrency(getFinalTotal())}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6 space-y-2 text-sm border-t border-gray-300 pt-4">
              <div className="flex justify-between">
                <span>Cash Received:</span>
                <span className="font-medium">
                  {formatCurrency(getCashReceived())}
                </span>
              </div>
              
              {getTotals().changeAmount > 0 && (
                <div className="flex justify-between font-bold text-green-600">
                  <span>Change Given:</span>
                  <span>{formatCurrency(getTotals().changeAmount)}</span>
                </div>
              )}
            </div>

            {/* Cannabis Compliance Notice */}
            <div className="border-2 border-yellow-400 bg-yellow-50 p-3 mb-6 text-xs">
              <div className="font-bold mb-2 text-center">⚠️ IMPORTANT CANNABIS NOTICE ⚠️</div>
              <div className="space-y-1 text-center">
                <p>This product has not been analyzed or approved by the FDA.</p>
                <p>Keep out of reach of children and pets.</p>
                <p>For use only by adults 21 years of age or older.</p>
                <p>Do not operate a vehicle or machinery under the influence.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-gray-300 pt-4 text-xs text-gray-600">
              <p className="font-medium">Thank you for your business!</p>
              <p>Visit us again soon!</p>
              <p className="mt-2">Questions? Call us at {getFacilityPhone()}</p>
              
              <div className="mt-3 text-xs">
                <p className="font-medium">Return Policy:</p>
                <p>Returns accepted within 30 days with receipt.</p>
                <p>Product must be unopened and in original packaging.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;