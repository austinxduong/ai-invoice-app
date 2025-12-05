import React, { useEffect } from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { calculateCartTax, formatCurrency, getTaxRates } from '../../utils/cannabisTax';
import CartItem from './CartItem';

const CartModal = () => {
  const navigate = useNavigate();
  const { items, isModalOpen, toggleModal, clearCart, itemCount } = useCart();

  // 🔧 FIX: Prevent body scroll when modal is open (mobile fix)
  useEffect(() => {
    if (isModalOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Prevent iOS bounce effect
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const taxCalculation = calculateCartTax(items);
  const taxRates = getTaxRates();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    navigate('/invoices/new', { 
      state: { 
        cartItems: items,
        taxCalculation 
      } 
    });
    toggleModal();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* 🔧 FIX: Improved backdrop for mobile */}
      <div 
        className="absolute inset-0 bg-opacity-30 transition-opacity"
        onClick={toggleModal}
        // Prevent backdrop scroll on mobile
        style={{ touchAction: 'none' }}
      />
      
      {/* 🔧 FIX: Mobile-optimized modal container */}
      <div className="absolute inset-0 flex justify-end">
        <div className="relative w-full sm:w-96 sm:max-w-md bg-white shadow-2xl flex flex-col h-full">
          
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={toggleModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* 🔧 FIX: Scrollable content area */}
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Scrollable Items Section */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4">
                {items.length === 0 ? (
                  // Empty State
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Add products to get started
                    </p>
                    <button
                      onClick={toggleModal}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <CartItem key={item.cartItemId} item={item} />
                      ))}
                    </div>

                    {/* Tax Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
                      <h3 className="font-medium text-gray-900 text-sm mb-3">
                        Order Summary
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{formatCurrency(taxCalculation.subtotal)}</span>
                        </div>

                        {taxCalculation.taxes.excise > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Excise Tax</span>
                            <span>{formatCurrency(taxCalculation.taxes.excise)}</span>
                          </div>
                        )}

                        {taxCalculation.taxes.sales.total > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sales Tax</span>
                            <span>{formatCurrency(taxCalculation.taxes.sales.total)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-base font-semibold border-t pt-2 mt-2">
                          <span>Total</span>
                          <span className="text-green-600">
                            {formatCurrency(taxCalculation.grandTotal)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        * Tax rates comply with local cannabis regulations
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 🔧 FIX: Fixed Footer - Always visible */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white space-y-3">
                <button
                  onClick={clearCart}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear Cart
                </button>
                
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;