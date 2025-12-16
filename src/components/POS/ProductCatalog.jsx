import React, { useState, useEffect } from 'react';
import { X, Star, Package, Info } from 'lucide-react'; 
import { productApi } from '../../services/productApi';
import { useCart } from '../../context/CartContext'; 
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';


const ProductCatalog = () => {


  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    inStock: false
  });
const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Cannabis categories
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'flower', label: 'Flower' },
    { value: 'edible', label: 'Edibles' },
    { value: 'concentrate', label: 'Concentrates' },
    { value: 'pre-roll', label: 'Pre-Rolls' },
    { value: 'topical', label: 'Topicals' },
    { value: 'accessory', label: 'Accessories' }
  ];

  // Load products
  const loadProducts = async (newFilters = filters, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        ...newFilters,
        page,
        limit: 12
      };

      const response = await productApi.getProducts(queryParams);
      
      setProducts(response.products || []);
      setPagination({
        page: response.pagination?.current || 1,
        totalPages: response.pagination?.pages || 1,
        totalProducts: response.pagination?.total || 0
      });
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadProducts(newFilters, 1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(filters, 1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    loadProducts(filters, newPage);
  };

const { addToCart } = useCart();

// Handle add to cart - REAL implementation
const handleAddToCart = (product, selectedPricing = null) => {
  console.log('Adding to cart:', product);
  
  // If no pricing selected, use the first available pricing
  const pricing = selectedPricing || product.pricing?.[0];
  
  if (!pricing) {
    alert('Please select a pricing option first');
    return;
  }
  addToCart(product, pricing, 1);
}


  const handleViewDetails = (product) => {
    console.log("Viewing product:", product)
    setSelectedProduct(product)
    setShowDetailModal(true)
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  }



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cannabis Product Catalog</h1>
        <p className="text-gray-600">Browse our selection of lab-tested cannabis products</p>
      </div>

        <button
          onClick={() => navigate('/products/new')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 mb-5 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
          <span>+</span>
          <span>Add New Product</span>
        </button>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, strain, or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.category}
              onChange={(e) => handleFilterChange({...filters, category: e.target.value})}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock Filter */}
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange({...filters, inStock: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
            </label>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div className="flex">
            <div className="text-red-800">
              <p>{error}</p>
              <button
                onClick={() => loadProducts()}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {products.length > 0 ? (
            <>
              {/* Results Summary */}
              <div className="mb-6 text-sm text-gray-600">
                Showing {products.length} of {pagination.totalProducts} products
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No products found matching your criteria</div>
              <button
                onClick={() => handleFilterChange({ category: '', search: '', inStock: false })}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
            {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0  bg-opacity-50 transition-opacity"
            onClick={closeDetailModal}
          />
          
          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={closeDetailModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Product Image */}
                <div className="mb-6">
                  {selectedProduct.images?.[0] ? (
                    <img 
                      src={selectedProduct.images[0].url} 
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProduct.name)}&size=400&background=10b981&color=ffffff&bold=true`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-green-600" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.subcategory && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {selectedProduct.subcategory}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">SKU:</span> {selectedProduct.sku}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Stock:</span> {selectedProduct.inventory?.currentStock || 0} {selectedProduct.inventory?.unit || 'units'}
                      </div>
                    </div>
                  </div>

                  {/* Cannabinoids */}
                  {selectedProduct.cannabinoids && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Cannabinoid Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.cannabinoids.thcPercentage > 0 && (
                          <div>
                            <span className="block text-sm font-medium text-gray-700">THC</span>
                            <span className="text-lg font-bold text-green-600">{selectedProduct.cannabinoids.thcPercentage}%</span>
                          </div>
                        )}
                        {selectedProduct.cannabinoids.cbdPercentage > 0 && (
                          <div>
                            <span className="block text-sm font-medium text-gray-700">CBD</span>
                            <span className="text-lg font-bold text-blue-600">{selectedProduct.cannabinoids.cbdPercentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Effects */}
                  {selectedProduct.effects?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Effects</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.effects.map((effect, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedProduct.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  )}

                  {/* Pricing */}
                  {selectedProduct.pricing?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Available Sizes & Pricing</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {selectedProduct.pricing.map((pricing, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                              <div>
                                <span className="font-medium">{pricing.weight}g</span>
                                {pricing.unit && (
                                  <span className="text-gray-500 text-sm ml-2">({pricing.unit})</span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-green-600">${pricing.price}</span>
                                <div className="text-xs text-gray-500">
                                  ${(pricing.price / pricing.weight).toFixed(2)}/g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Compliance Info */}
                  {selectedProduct.compliance && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Compliance Information</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        {selectedProduct.compliance.batchNumber && (
                          <div><span className="font-medium">Batch Number:</span> {selectedProduct.compliance.batchNumber}</div>
                        )}
                        {selectedProduct.compliance.testDate && (
                          <div><span className="font-medium">Test Date:</span> {new Date(selectedProduct.compliance.testDate).toLocaleDateString()}</div>
                        )}
                        {selectedProduct.compliance.labResults && (
                          <div><span className="font-medium">Lab:</span> {selectedProduct.compliance.labResults}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
                <div className="flex space-x-3">
                  <button
                    onClick={closeDetailModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      closeDetailModal();
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ProductCatalog;

