// frontend/src/components/rma/RefundReceipt.jsx
// Printable cash refund receipt

import React, { useEffect } from 'react';

const RefundReceipt = ({ receiptData, onPrinted }) => {
  useEffect(() => {
    // Auto-print when component mounts
    const timer = setTimeout(() => {
      window.print();
      if (onPrinted) onPrinted();
    }, 500);

    return () => clearTimeout(timer);
  }, [onPrinted]);

  if (!receiptData) return null;

  return (
    <div className="hidden print:block">
      <div className="max-w-sm mx-auto p-4 font-mono text-xs">
        {/* Header */}
        <div className="text-center mb-4 border-b-2 border-black pb-4">
          <h1 className="text-lg font-bold">{receiptData.organization.name}</h1>
          {receiptData.organization.address && (
            <p className="mt-1">{receiptData.organization.address}</p>
          )}
          {receiptData.organization.phone && (
            <p>{receiptData.organization.phone}</p>
          )}
          {receiptData.organization.licenseNumber && (
            <p className="mt-1 text-[10px]">License: {receiptData.organization.licenseNumber}</p>
          )}
        </div>

        {/* Receipt Type */}
        <div className="text-center mb-4 border-b border-dashed border-black pb-4">
          <h2 className="text-2xl font-bold">*** REFUND ***</h2>
          <p className="mt-2">CASH REFUND RECEIPT</p>
        </div>

        {/* Receipt Info */}
        <div className="mb-4 space-y-1 border-b border-dashed border-black pb-4">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span className="font-bold">{receiptData.receipt.number}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{receiptData.receipt.localDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{receiptData.receipt.localTime}</span>
          </div>
          {receiptData.refund.registerId && (
            <div className="flex justify-between">
              <span>Register:</span>
              <span>{receiptData.refund.registerId}</span>
            </div>
          )}
          {receiptData.refund.processedBy && (
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{receiptData.refund.processedBy.firstName} {receiptData.refund.processedBy.lastName}</span>
            </div>
          )}
        </div>

        {/* RMA Info */}
        <div className="mb-4 space-y-1 border-b border-dashed border-black pb-4">
          <div className="flex justify-between">
            <span>RMA #:</span>
            <span className="font-bold">{receiptData.rma.rmaNumber}</span>
          </div>
          {receiptData.rma.invoiceNumber && (
            <div className="flex justify-between">
              <span>Original Invoice:</span>
              <span>{receiptData.rma.invoiceNumber}</span>
            </div>
          )}
          <div className="mt-2">
            <p className="font-semibold">Return Reason:</p>
            <p className="text-[10px] mt-1">{receiptData.rma.returnReason}</p>
            {receiptData.rma.detailedReason && (
              <p className="text-[10px] mt-1">{receiptData.rma.detailedReason}</p>
            )}
          </div>
        </div>

        {/* Customer Info */}
        {receiptData.customer && (
          <div className="mb-4 space-y-1 border-b border-dashed border-black pb-4">
            <p className="font-semibold mb-1">Customer:</p>
            <div className="text-[10px]">
              <p>{receiptData.customer.name}</p>
              {receiptData.customer.phone && <p>Phone: {receiptData.customer.phone}</p>}
              {receiptData.customer.email && <p>Email: {receiptData.customer.email}</p>}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-4 border-b border-dashed border-black pb-4">
          <p className="font-semibold mb-2">REFUNDED ITEMS:</p>
          {receiptData.items.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{item.name}</span>
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span>SKU: {item.sku}</span>
                <span>Qty: {item.quantity}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>${item.price.toFixed(2)} each</span>
                <span className="font-semibold">${item.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Refund Total */}
        <div className="mb-4 border-b-2 border-black pb-4">
          <div className="flex justify-between text-xl font-bold">
            <span>REFUND TOTAL:</span>
            <span>${receiptData.refund.amount.toFixed(2)}</span>
          </div>
          <p className="text-center mt-2 text-[10px]">*** CASH REFUNDED ***</p>
        </div>

        {/* Important Notices */}
        <div className="text-[10px] space-y-2 mb-4">
          <p className="text-center font-semibold">IMPORTANT NOTICE</p>
          <p>This is your official refund receipt. Please keep for your records.</p>
          <p>All sales are final after 30 days. Opened or used products cannot be returned.</p>
          <p>Cannabis products must be returned with original packaging and state tracking labels intact.</p>
        </div>

        {/* Compliance Notice */}
        <div className="text-[10px] border-t border-black pt-4 mb-4">
          <p className="font-semibold text-center mb-2">CANNABIS COMPLIANCE</p>
          <p className="text-center">For use only by persons 21 years of age or older.</p>
          <p className="text-center mt-1">This product has intoxicating effects.</p>
          <p className="text-center mt-1">Do not operate a vehicle or machinery under the influence.</p>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] border-t border-dashed border-black pt-4">
          <p>Thank you for your business!</p>
          <p className="mt-2">For questions, please contact us at:</p>
          {receiptData.organization.phone && <p>{receiptData.organization.phone}</p>}
          {receiptData.organization.email && <p>{receiptData.organization.email}</p>}
        </div>

        {/* Barcode Placeholder */}
        <div className="text-center mt-4">
          <div className="inline-block px-4 py-2 border border-black">
            <p className="text-[8px]">{receiptData.receipt.number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundReceipt;