// frontend/src/components/POS/ProductCard.jsx
// ✅ COMPLETE: Shows ALL effects + Category/Subcategory labels + Consistent heights

import React, { useState } from 'react';
import { Package } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const [selectedPricing, setSelectedPricing] = useState(product.pricing?.[0] || null);

  // ✅ Handle both OLD and NEW schema
  const thc = product.thcContent !== undefined 
    ? product.thcContent 
    : (product.cannabinoids?.thcPercentage || 0);
    
  const cbd = product.cbdContent !== undefined 
    ? product.cbdContent 
    : (product.cannabinoids?.cbdPercentage || 0);
    
  const stock = product.stockQuantity !== undefined 
    ? product.stockQuantity 
    : (product.inventory?.currentStock || 0);
    
  const stockUnit = product.unit || product.inventory?.unit || 'unit';
  
  const lowStockThreshold = product.lowStockThreshold !== undefined
    ? product.lowStockThreshold
    : (product.inventory?.lowStockAlert || 10);

  // ✅ Stock status
  const getStockStatus = () => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50' };
    return { label: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  const stockStatus = getStockStatus();

  // ✅ Get all effects
  const effects = product.effects || [];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
        {product.images?.[0] ? (
          <img 
            src={product.images[0].url} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=10b981&color=ffffff&bold=true`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-green-600" />
          </div>
        )}
        
        {/* Stock Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${stockStatus.color}`}>
          {stockStatus.label}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* SKU */}
        <p className="text-xs text-gray-500 mb-3">SKU: {product.sku}</p>

        {/* ✅ Category & Subcategory with Labels */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Category:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800 capitalize">
              {product.category}
            </span>
          </div>
          {product.subcategory && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Subcategory</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {product.subcategory}
              </span>
            </div>
          )}
        </div>

        {/* Cannabinoids */}
        {(thc > 0 || cbd > 0) && (
          <div className="flex gap-2 mb-3">
            {thc > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                {thc}% THC
              </span>
            )}
            {cbd > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {cbd}% CBD
              </span>
            )}
          </div>
        )}

        {/* ✅ Show ALL Effects */}
        {effects.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {effects.map((effect, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 lowercase italic"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Pricing Section - Always consistent height */}
        <div className="mt-auto">
          {/* Pricing Selector - If multiple pricing options */}
          {product.pricing && product.pricing.length > 1 ? (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
              <select
                value={selectedPricing ? `${selectedPricing.weight}-${selectedPricing.unit}` : ''}
                onChange={(e) => {
                  const [weight, unit] = e.target.value.split('-');
                  const pricing = product.pricing.find(p => 
                    p.weight === parseFloat(weight) && p.unit === unit
                  );
                  setSelectedPricing(pricing);
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {product.pricing.map((pricing, index) => (
                  <option 
                    key={index} 
                    value={`${pricing.weight}-${pricing.unit}`}
                  >
                    {pricing.weight}g ({pricing.unit}) - ${pricing.price}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            // ✅ Placeholder div to maintain consistent height
            <div className="mb-3 h-[52px]"></div>
          )}

          {/* Price Display */}
          <div className="mb-3">
            {selectedPricing ? (
              <>
                <div className="text-2xl font-bold text-green-600">
                  ${selectedPricing.price}
                </div>
                <div className="text-xs text-gray-500">
                  per {selectedPricing.unit} • ${(selectedPricing.price / selectedPricing.weight).toFixed(2)}/g
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${product.pricing?.[0]?.price || 0}
              </div>
            )}
          </div>

          {/* Stock Info */}
          <p className="text-sm text-gray-600 mb-4">
            Stock: {stock} {stockUnit}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onAddToCart(product, selectedPricing)}
              disabled={stock === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Add to Cart
            </button>
            <button
              onClick={() => onViewDetails(product)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;