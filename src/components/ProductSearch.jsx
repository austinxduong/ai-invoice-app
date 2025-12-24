import React, { useState, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import productApi from '../services/productApi';
import { usePOSTransaction } from '../context/POSTransaction';

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState({});
  
  const { addItem } = usePOSTransaction();

  // Load products
  const loadProducts = async (search = '') => {
    try {
      setLoading(true);
      const response = await productApi.getProducts({
        search,
        limit: 20,
        // ❌ REMOVED: inStock: true  (this filter doesn't work with new schema)
        // Instead, we'll filter in the frontend
      });
      
      // Filter products with stock in frontend
      const inStockProducts = (response.products || []).filter(p => {
        const stock = p.stockQuantity !== undefined ? p.stockQuantity : (p.inventory?.currentStock || 0);
        return stock > 0;
      });
      
      setProducts(inStockProducts);
      console.log('📦 Loaded products:', inStockProducts.length);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Search products
  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(searchTerm);
  };

  // Add to transaction
  const handleAddToTransaction = (product) => {
    // Handle both old schema (pricing array) and new schema (single price)
    const pricing = selectedPricing[product._id] || 
                   product.pricing?.[0] || 
                   {
                     price: product.price || 0,
                     weight: 1,
                     unit: product.unit || 'unit'
                   };
    
    if (!pricing || !pricing.price) {
      alert('Please select a size for this product');
      return;
    }

    addItem(product, pricing, 1);
    
    // Clear selection after adding
    setSelectedPricing(prev => ({
      ...prev,
      [product._id]: null
    }));
  };

  // Update pricing selection
  const handlePricingChange = (productId, pricing) => {
    setSelectedPricing(prev => ({
      ...prev,
      [productId]: pricing
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or strain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const selectedPrice = selectedPricing[product._id];
          
          // ✅ Handle both old and new schema
          const stock = product.stockQuantity !== undefined ? product.stockQuantity : (product.inventory?.currentStock || 0);
          const unit = product.unit || product.inventory?.unit || 'units';
          const thc = product.thcContent !== undefined ? product.thcContent : (product.cannabinoids?.thcPercentage || 0);
          const cbd = product.cbdContent !== undefined ? product.cbdContent : (product.cannabinoids?.cbdPercentage || 0);
          const price = product.price || product.pricing?.[0]?.price || 0;
          
          return (
            <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-lg relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="object-cover w-full h-32 rounded-t-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gradient-to-br from-green-50 to-green-100">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {stock} in stock
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                
                {/* Category & Type */}
                <div className="flex space-x-2 mb-3">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                      {product.subcategory}
                    </span>
                  )}
                </div>

                {/* THC/CBD */}
                <div className="flex space-x-3 text-xs mb-3">
                  {thc > 0 && (
                    <span className="text-green-600">
                      THC: {thc}%
                    </span>
                  )}
                  {cbd > 0 && (
                    <span className="text-blue-600">
                      CBD: {cbd}%
                    </span>
                  )}
                </div>

                {/* Pricing Display - Show single price or dropdown */}
                {product.pricing?.length > 0 ? (
                  <div className="mb-3">
                    <select
                      value={selectedPrice ? JSON.stringify(selectedPrice) : ''}
                      onChange={(e) => {
                        const pricing = e.target.value ? JSON.parse(e.target.value) : null;
                        handlePricingChange(product._id, pricing);
                      }}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Select size...</option>
                      {product.pricing.map((pricing, index) => (
                        <option key={index} value={JSON.stringify(pricing)}>
                          {pricing.weight}g - ${pricing.price}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className="text-lg font-bold text-green-600">
                      ${price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      per {unit}
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={() => handleAddToTransaction(product)}
                  disabled={product.pricing?.length > 0 && !selectedPrice}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    (product.pricing?.length > 0 && !selectedPrice)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Transaction</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No products in stock'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;