import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const getStrainColor = (subcategory) => {
    const colors = {
      indica: 'bg-purple-100 text-purple-800',
      sativa: 'bg-green-100 text-green-800',
      hybrid: 'bg-blue-100 text-blue-800',
    };
    return colors[subcategory?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const itemTotal = (item.pricingOption?.price || 0) * item.quantity;

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-2xl">🌿</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
        
        {/* Strain Badge */}
        {item.subcategory && (
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStrainColor(item.subcategory)}`}>
            {item.subcategory}
          </span>
        )}

        {/* THC/CBD */}
        <div className="flex space-x-2 mt-1">
          {item.cannabis?.thc > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              THC: {item.cannabis.thc}%
            </span>
          )}
          {item.cannabis?.cbd > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              CBD: {item.cannabis.cbd}%
            </span>
          )}
        </div>

        {/* Pricing Option */}
        {item.pricingOption && (
          <p className="text-xs text-gray-600 mt-1">
            {item.pricingOption.weight}g - ${item.pricingOption.price}
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </button>
        
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => updateQuantity(item.cartItemId, parseInt(e.target.value) || 1)}
          className="w-16 text-center text-sm border border-gray-300 rounded-md py-1"
        />
        
        <button
          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          ${itemTotal.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.cartItemId)}
        className="p-1 text-red-600 hover:text-red-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CartItem;