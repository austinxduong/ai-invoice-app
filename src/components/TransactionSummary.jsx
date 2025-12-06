import React from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { usePOSTransaction } from '../context/POSTransaction';

const TransactionSummary = () => {
  const { 
    items, 
    totals, 
    removeItem, 
    updateQuantity, 
    clearTransaction,
    hasItems 
  } = usePOSTransaction();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get strain color for badges
  const getStrainColor = (subcategory) => {
    const colors = {
      indica: 'bg-purple-100 text-purple-800',
      sativa: 'bg-green-100 text-green-800',
      hybrid: 'bg-blue-100 text-blue-800',
    };
    return colors[subcategory?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Items in Transaction
        </h3>
        <p className="text-gray-500 text-sm">
          Search and add products to start a transaction
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Transaction Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <div 
            key={item.transactionItemId} 
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {/* Item Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate text-sm">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">
                  SKU: {item.sku}
                </p>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeItem(item.transactionItemId)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Remove item"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Item Details */}
            <div className="space-y-2">
              {/* Category and Type Badges */}
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  {item.category}
                </span>
                {item.subcategory && (
                  <span className={`px-2 py-1 text-xs rounded ${getStrainColor(item.subcategory)}`}>
                    {item.subcategory}
                  </span>
                )}
              </div>

              {/* Cannabis Info */}
              {item.cannabis && (
                <div className="flex space-x-3 text-xs">
                  {item.cannabis.thc > 0 && (
                    <span className="text-green-600">
                      THC: {item.cannabis.thc}%
                    </span>
                  )}
                  {item.cannabis.cbd > 0 && (
                    <span className="text-blue-600">
                      CBD: {item.cannabis.cbd}%
                    </span>
                  )}
                </div>
              )}

              {/* Pricing Info */}
              <div className="text-xs text-gray-600">
                {item.pricingOption?.weight}g • {formatCurrency(item.pricingOption?.price || 0)} each
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.transactionItemId, item.quantity - 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.transactionItemId, item.quantity + 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency((item.pricingOption?.price || 0) * item.quantity)}
                </div>
              </div>

              {/* Batch Number */}
              {item.cannabis?.batchNumber && (
                <div className="text-xs text-gray-500">
                  Batch: {item.cannabis.batchNumber}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Totals */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>

          {/* Discount */}
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(totals.discountAmount)}</span>
            </div>
          )}

          {/* Tax Breakdown */}
          {totals.taxAmount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cannabis Tax</span>
                <span className="font-medium">
                  {formatCurrency(totals.taxAmount)}
                </span>
              </div>

              {/* Detailed Tax Breakdown */}
              {totals.taxBreakdown && (
                <div className="ml-4 space-y-1 text-xs text-gray-500">
                  {totals.taxBreakdown.excise > 0 && (
                    <div className="flex justify-between">
                      <span>Excise Tax</span>
                      <span>{formatCurrency(totals.taxBreakdown.excise)}</span>
                    </div>
                  )}
                  {totals.taxBreakdown.sales?.total > 0 && (
                    <div className="flex justify-between">
                      <span>Sales Tax</span>
                      <span>{formatCurrency(totals.taxBreakdown.sales.total)}</span>
                    </div>
                  )}
                  {totals.taxBreakdown.cultivation > 0 && (
                    <div className="flex justify-between">
                      <span>Cultivation Tax</span>
                      <span>{formatCurrency(totals.taxBreakdown.cultivation)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>
          </div>

          {/* Change Amount (if cash received) */}
          {totals.changeAmount > 0 && (
            <div className="flex justify-between text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <span className="font-medium">Change Due</span>
              <span className="font-bold">
                {formatCurrency(totals.changeAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Clear Transaction Button */}
        <button
          onClick={clearTransaction}
          className="w-full mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Transaction
        </button>
      </div>
    </div>
  );
};

export default TransactionSummary;