import React, { useRef } from 'react';
import { X, Printer, Download, Check } from 'lucide-react';
import { usePOSTransaction } from '../context/POSTransaction';

const ReceiptModal = ({ onClose, transaction = null }) => {
  const { completedTransactions, totals } = usePOSTransaction();
  const receiptRef = useRef();

console.log('🧾 ReceiptModal - Props received:', { transaction, onClose });
console.log('🧾 ReceiptModal - Completed transactions:', completedTransactions);

  // Use provided transaction or the most recent completed transaction
const receiptTransaction = transaction || completedTransactions[completedTransactions.length - 1];
console.log('🧾 ReceiptModal - Receipt transaction:', receiptTransaction);

// If no transaction is available, just close the modal instead of showing an alert
if (!receiptTransaction) {
  console.log('❌ No transaction available, closing receipt modal');
  setTimeout(() => onClose(), 0); // Use setTimeout to avoid calling during render
  return null;
}

    console.log('🧾 ReceiptModal - About to render with transaction:', receiptTransaction);


// Helper functions to handle both transaction formats (localStorage vs database)
const getTransactionId = () => {
  return receiptTransaction.transactionId || receiptTransaction.id || receiptTransaction._id || 'N/A';
};

const getTransactionTimestamp = () => {
  return receiptTransaction.createdAt || receiptTransaction.timestamp || new Date();
};

const getPaymentMethod = () => {
  return receiptTransaction.paymentMethod || 'cash';
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

  // Rest of your existing ReceiptModal component code...
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
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

  // Print receipt
  const handlePrint = () => {
    window.print();
  };

  // Download receipt as text
  const handleDownload = () => {
    const receiptText = generateReceiptText();
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptTransaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Generate plain text receipt
  const generateReceiptText = () => {
    const tx = receiptTransaction;
    const divider = '========================================';
    
    return `
${divider}
           CANNABIS DISPENSARY
${divider}

Transaction ID: ${tx.id}
Date: ${formatDate(tx.timestamp)}
Cashier: Store Associate

${divider}
ITEMS PURCHASED
${divider}

${tx.items.map(item => `
${item.name}
SKU: ${item.sku} | ${item.pricingOption?.weight}g
Qty: ${item.quantity} x ${formatCurrency(item.pricingOption?.price)}
${item.cannabis?.thc ? `THC: ${item.cannabis.thc}% ` : ''}${item.cannabis?.cbd ? `CBD: ${item.cannabis.cbd}%` : ''}
${item.cannabis?.batchNumber ? `Batch: ${item.cannabis.batchNumber}` : ''}
Subtotal: ${formatCurrency((item.pricingOption?.price || 0) * item.quantity)}
`).join('')}

${divider}
PAYMENT SUMMARY
${divider}

Subtotal: ${formatCurrency(tx.totals.subtotal)}
${tx.totals.discountAmount > 0 ? `Discount: -${formatCurrency(tx.totals.discountAmount)}\n` : ''}Cannabis Tax: ${formatCurrency(tx.totals.taxAmount)}
TOTAL: ${formatCurrency(tx.totals.grandTotal)}

Cash Received: ${formatCurrency(tx.receiptData?.cashReceived || 0)}
${tx.totals.changeAmount > 0 ? `Change Given: ${formatCurrency(tx.totals.changeAmount)}` : ''}

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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Receipt</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Receipt Content */}
          <div ref={receiptRef} className="p-6" style={{ fontFamily: 'monospace' }}>
            
            {/* Business Header */}
            <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
              <h3 className="text-lg font-bold">CANNABIS DISPENSARY</h3>
              <p className="text-sm text-gray-600">123 Main Street</p>
              <p className="text-sm text-gray-600">Cannabis City, CC 12345</p>
              <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
              <p className="text-sm text-gray-600 mt-2">License #: ABC123456</p>
            </div>

            {/* Transaction Info */}
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
                <span className="font-medium">Store Associate</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium uppercase">{getPaymentMethod()}</span>
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
                    {/* Item Name */}
                    <div className="font-medium">{item.name}</div>
                    
                    {/* Item Details */}
                    <div className="flex justify-between text-gray-600">
                      <span>SKU: {item.sku}</span>
                      <span>{item.pricingOption?.weight}g</span>
                    </div>
                    
                    {/* Cannabis Info */}
                    {item.cannabis && (
                      <div className="text-gray-600">
                        {item.cannabis.thc > 0 && `THC: ${item.cannabis.thc}% `}
                        {item.cannabis.cbd > 0 && `CBD: ${item.cannabis.cbd}% `}
                        {item.subcategory && `(${item.subcategory})`}
                      </div>
                    )}
                    
                    {/* Batch Number */}
                    {item.cannabis?.batchNumber && (
                      <div className="text-gray-600">
                        Batch: {item.cannabis.batchNumber}
                      </div>
                    )}
                    
                    {/* Price Line */}
                    <div className="flex justify-between">
                      <span>Qty: {item.quantity} x {formatCurrency(item.pricingOption?.price || 0)}</span>
                      <span className="font-medium">
                        {formatCurrency((item.pricingOption?.price || 0) * item.quantity)}
                      </span>
                    </div>
                    
                    {/* Divider */}
                    {index < receiptTransaction.items.length - 1 && (
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
                
                {getTotals().discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>{formatCurrency(getTotals().discountAmount || 0)}</span>
                  </div>
                )}
                
                {/* Detailed Tax Breakdown */}
                {getTotals().taxBreakdown && (
                  <div className="space-y-1 ml-2">
                    {receiptTransaction.totals.taxBreakdown.excise > 0 && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Cannabis Excise Tax:</span>
                        <span>{formatCurrency(getTotals().taxBreakdown?.excise || 0)}</span>
                      </div>
                    )}
                    {receiptTransaction.totals.taxBreakdown.sales?.total > 0 && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Sales Tax:</span>
                        <span>{formatCurrency(receiptTransaction.totals.taxBreakdown.sales.total)}</span>
                      </div>
                    )}
                    {receiptTransaction.totals.taxBreakdown.cultivation > 0 && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Cultivation Tax:</span>
                        <span>{formatCurrency(receiptTransaction.totals.taxBreakdown.cultivation)}</span>
                      </div>
                    )}
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
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cash Received:</span>
                <span className="font-medium">
                  {formatCurrency(getReceiptData().cashReceived || 0)}
                </span>
              </div>
              
              {receiptTransaction.totals.changeAmount > 0 && (
                <div className="flex justify-between font-bold text-green-600">
                  <span>Change Given:</span>
                  <span>{formatCurrency(getTotals().changeAmount || 0)}</span>
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
              <p className="mt-2">Questions? Call us at (555) 123-4567</p>
              
              {/* Return Policy */}
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