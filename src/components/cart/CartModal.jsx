import React from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { calculateCartTax, formatCurrency, getTaxRates } from '../../utils/cannabisTax';
import CartItem from './CartItem';

const CartModal = () => {
  const navigate = useNavigate();
  const { items, isModalOpen, toggleModal, clearCart, itemCount } = useCart();

  if (!isModalOpen) return null;

  const taxCalculation = calculateCartTax(items);
  const taxRates = getTaxRates();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Navigate to invoice creation with cart items
    navigate('/invoices/new', { 
      state: { 
        cartItems: items,
        taxCalculation 
      } 
    });
    toggleModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-opacity-20 transition-opacity"
            onClick={toggleModal}
        />

        {/* Modal */}
        <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Shopping Cart ({itemCount} items)
            </h2>
          </div>
          <button
            onClick={toggleModal}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Browse products and add items to get started
              </p>
              <button
                onClick={toggleModal}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-0 mb-8">
                {items.map((item) => (
                  <CartItem key={item.cartItemId} item={item} />
                ))}
              </div>

              {/* Tax Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(taxCalculation.subtotal)}
                  </span>
                </div>

                {/* Excise Tax */}
                {taxCalculation.taxes.excise > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Excise Tax ({taxRates.exciseTax.rate}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(taxCalculation.taxes.excise)}
                    </span>
                  </div>
                )}

                {/* Sales Tax Breakdown */}
                {taxCalculation.taxes.sales.state > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      State Sales Tax ({taxRates.salesTax.state.rate}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(taxCalculation.taxes.sales.state)}
                    </span>
                  </div>
                )}
                
                {taxCalculation.taxes.sales.county > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      County Sales Tax ({taxRates.salesTax.county.rate}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(taxCalculation.taxes.sales.county)}
                    </span>
                  </div>
                )}
                
                {taxCalculation.taxes.sales.city > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      City Sales Tax ({taxRates.salesTax.city.rate}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(taxCalculation.taxes.sales.city)}
                    </span>
                  </div>
                )}

                {/* Cultivation Tax */}
                {taxCalculation.taxes.cultivation > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Cultivation Tax (${taxRates.cultivationTax.ratePerGram}/gram)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(taxCalculation.taxes.cultivation)}
                    </span>
                  </div>
                )}

                {/* Total Tax */}
                {taxCalculation.taxes.total > 0 && (
                  <div className="flex justify-between text-sm border-t pt-3">
                    <span className="text-gray-600 font-medium">Total Tax</span>
                    <span className="font-semibold">
                      {formatCurrency(taxCalculation.taxes.total)}
                    </span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="flex justify-between text-lg font-bold border-t pt-3 border-gray-300">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatCurrency(taxCalculation.grandTotal)}
                  </span>
                </div>

                {/* Tax Note */}
                <p className="text-xs text-gray-500 mt-4">
                  * Tax rates and calculations comply with local cannabis tax regulations
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-3">
            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Cart
            </button>
            
            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;