import React, { useState } from 'react';
import { cannabisHelpers } from '../../services/productApi';
import { useCart } from '../../context/CartContext'; // 

const ProductCard = ({ product, onViewDetails }) => { // Removed onAddToCart prop
    console.log('🧾 ProductCard received product:', product); // Debug log
    
    // Add these new lines:
    const [selectedPricing, setSelectedPricing] = useState(null);
    const { addToCart } = useCart();
    
    const inventoryStatus = cannabisHelpers.getInventoryStatus(product);
    const cannabinoids = cannabisHelpers.formatCannabinoids(product.cannabinoids);
    const strainColor = cannabisHelpers.getStrainColor(product.subcategory);

    // Add this new function:
    const handleAddToCart = () => {
        if (!selectedPricing) {
            alert('Please select a size/pricing option');
            return;
        }
        
        addToCart(product, selectedPricing, 1);
        setSelectedPricing(null); // Reset selection after adding
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"> {/* FIXED: "bg white" */}
            {/* product image */}
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

                {/* category badge */}
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${strainColor}`}>
                        {product.subcategory} {/* FIXED: removed non-existent function */}
                    </span>
                </div>

                {/* stock status */}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${inventoryStatus.color}`}>
                        {inventoryStatus.text}
                    </span>
                </div>
            </div>

            {/* product info */}
            <div className="p-4">
                {/* product name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                </h3>

                {/* SKU */}
                <p className="text-sm text-gray-500 mb-2">
                    SKU: {product.sku}
                </p>

                {/* cannabinoids */}
                <div className="mb-3">
                    <div className="flex space-x-2 text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {cannabinoids.thc}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {cannabinoids.cbd} {/* FIXED: was showing THC twice */}
                        </span>
                    </div>
                </div>

                {/* effects */}
                {product.effects && product.effects.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {product.effects.slice(0,3).map((effect,index) => ( // FIXED: added parentheses
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

                {/* pricing */}
                <div className="mb-4">
                    {product.pricing && product.pricing.length > 0 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Size & Price
                            </label>
                            <select
                                value={selectedPricing ? JSON.stringify(selectedPricing) : ''}
                                onChange={(e) => setSelectedPricing(e.target.value ? JSON.parse(e.target.value) : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            >
                                <option value="">Choose a size...</option>
                                {product.pricing.map((pricing, index) => (
                                    <option key={index} value={JSON.stringify(pricing)}>
                                        {pricing.weight}g - ${pricing.price}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Show selected price prominently */}
                            {selectedPricing && (
                                <div className="mt-2 text-xl font-bold text-green-600">
                                    ${selectedPricing.price}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xl font-bold text-gray-900">
                            {cannabisHelpers.formatPricing(product.pricing)}
                        </div>
                    )}
                </div>

                {/* stock info */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Stock: {product.inventory?.currentStock || 0} {product.inventory?.unit || 'units'}
                    </p>
                </div>

                {/* actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={!cannabisHelpers.isInStock(product) || !selectedPricing}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            cannabisHelpers.isInStock(product) && selectedPricing
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    >
                    {!cannabisHelpers.isInStock(product) 
                        ? 'Out of Stock' 
                        : !selectedPricing 
                        ? 'Select Size First' 
                        : 'Add to Cart'
                    }
                    </button>
                    <button
                        onClick={() => onViewDetails(product)}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors" // FIXED: added "border"
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

// import React from 'react';
// import { cannabisHelpers } from '../../services/productApi';

// const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
//     const inventoryStatus = cannabisHelpers.getInventoryStatus(product);
//     const cannabinoids = cannabisHelpers.formatCannabinoids(product.cannabinoids);
//     const strainColor = cannabisHelpers.getStrainColor(product.subcategory);

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
//         {/* // product image */}
//         <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-xl relative">
//             {product.images && product.images.length > 0 ? (
//                 <img
//                     src={product.images[0].url}
//                     alt={product.images[0].alt || product.name}
//                     className="object-cover w-full h-48 rounded-t-xl"
//                 />
//             ) : (
//                 <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-50 to-green-100">
//                     <span className="text-green-600 text-4xl">🌿</span>
//                 </div>
//             )}

//             {/* categeory badge */}
//             <div className="absolute top-2 left-2">
//                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${strainColor}`}>
//                     {product.subcategory}
//                 </span>
//             </div>

//             {/* stock status */}
//             <div className="absolute top-2 right-2">
//                 <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${inventoryStatus.color}`}>
//                     {inventoryStatus.text}
//                 </span>
//             </div>
//         </div>

//         {/* product info */}
//         <div className="p-4">
//         {/* product name */}
//             <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                 {product.name}
//             </h3>

//         {/* SKU */}
//         <p className="text-sm text-gray-500 mb-2">
//             SKU: {product.sku}
//         </p>

//         {/* cannabinoids  */}
//         <div className="mb-3">
//             <div className="flex space-x-2 text-sm">
//                 <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
//                     {cannabinoids.thc}
//                 </span>
//                 <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                     {cannabinoids.cbd}
//                 </span>
//             </div>
//         </div>

//         {/* effects */}

//         {product.effects && product.effects.length > 0 && (
//             <div className="mb-3">
//                 <div className="flex flex-wrap gap-1">
//                     {product.effects.slice(0,3).map((effect,index) => {
//                         <span
//                             key={index}
//                             className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
//                         >
//                             {effect}
//                         </span>
//                     })}
//                 </div>
//             </div>
//         )}

//         {/* pricing */}
//         <div className="mb-4">
//             <div className="text-xl font-bold text-gray-900">
//                 {cannabisHelpers.formatPricing(product.pricing)}
//             </div>
//             {product.pricing && product.pricing.length > 1 && (
//                 <p className="text-sm text-gray-500">
//                     +{product.pricing.length - 1} more size{product.pricing.length > 2 ? 's' : ''}
//                 </p>
//             )}
//         </div>

//         {/* stock info */}
//         <div className="mb-4">
//             <p className="text-sm text-gray-600">
//                 Stock:{product.inventory?.currentStock || 0}{product.inventory?.unit||'units'}
//             </p>
//         </div>

//         {/* actions */}
//         <div className="flex space-x-2">
//             <button
//                 onClick={() => onAddToCart(product)}
//                 disabled={!cannabisHelpers.isInStock(product)}
//                 className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
//                     cannabisHelpers.isInStock(product)
//                     ?'bg-green-600 hover:bg-green 700 text-white'
//                     :'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 }`}
//             >
//                 {cannabisHelpers.isInStock(product) ? 'Add to Cart' : 'Out of Stock'}
//                 </button>
//                 <button
//                     onClick={() => onViewDetails(product)}
//                     className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//                 Details
//             </button>
//         </div>
//     </div>
// </div>
//     );
// };

// export default ProductCard;