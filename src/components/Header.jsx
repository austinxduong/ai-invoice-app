import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { itemCount, toggleModal } = useCart();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side - Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Cannabis POS
            </h1>
          </div>

          {/* Right side - Cart Icon */}
          <div className="flex items-center space-x-4">
            {/* 🛒 THIS IS WHERE THE CART ICON GOES */}
            <button
              onClick={toggleModal}
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors rounded-md hover:bg-gray-100"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;