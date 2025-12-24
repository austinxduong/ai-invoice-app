import React, { useState } from 'react';
import { cannabisHelpers } from '../../services/productApi';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, onViewDetails }) => {
    const [selectedPricing, setSelectedPricing] = useState(null);
    const { addToCart } = useCart();
    
    // ✅ Handle BOTH old and new schema
    const price = product.price || product.pricing?.[0]?.price || 0;
    const stock = product.stockQuantity !== undefined ? product.stockQuantity : (product.inventory?.currentStock || 0);
    const unit = product.unit || product.inventory?.unit || 'units';
    const thc = product.thcContent !== undefined ? product.thcContent : (product.cannabinoids?.thcPercentage || 0);
    const cbd = product.cbdContent !== undefined ? product.cbdContent : (product.cannabinoids?.cbdPercentage || 0);
    
    // Check stock status
    const isInStock = stock > 0;
    const isLowStock = stock <= (product.lowStockThreshold || 10) && stock > 0;
    
    const inventoryStatus = {
        text: !isInStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock',
        color: !isInStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
    };
    
    const strainColor = cannabisHelpers.getStrainColor(product.subcategory);

    const handleAddToCart = () => {
        // For new schema (single price), create a pricing object
        const pricingOption = product.pricing?.[0] || {
            price: price,
            weight: 1,
            unit: unit
        };
        
        addToCart(product, pricingOption, 1);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-xl relative">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        className="object-cover w-full h-48 rounded-t-xl"
                    />
                ) : (
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-50 to-green-100">
                        <span className="text-green-600 text-4xl">🌿</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${strainColor}`}>
                        {product.subcategory || product.category}
                    </span>
                </div>

                {/* Stock Status */}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${inventoryStatus.color}`}>
                        {inventoryStatus.text}
                    </span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                </h3>

                {/* SKU */}
                <p className="text-sm text-gray-500 mb-2">
                    SKU: {product.sku}
                </p>

                {/* Cannabinoids */}
                <div className="mb-3">
                    <div className="flex space-x-2 text-sm">
                        {thc > 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {thc}% THC
                            </span>
                        )}
                        {cbd > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {cbd}% CBD
                            </span>
                        )}
                    </div>
                </div>

                {/* Effects */}
                {product.effects && product.effects.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {product.effects.slice(0, 3).map((effect, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                >
                                    {effect}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <div className="mb-4">
                    <div className="text-2xl font-bold text-green-600">
                        ${price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                        per {unit}
                    </div>
                </div>

                {/* Stock Info */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Stock: {stock} {unit}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            isInStock
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {!isInStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                        onClick={() => onViewDetails(product)}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;