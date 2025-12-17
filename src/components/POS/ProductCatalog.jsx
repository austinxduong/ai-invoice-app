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
  const [exportLoading, setExportLoading] = useState(false)
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

// Export products to CSV
const exportProducts = async () => {
  try {
    setExportLoading(true); // Use export loading instead of main loading
    setError(null);
    
    // Fetch ALL products without pagination
    const response = await productApi.getProducts({
      page: 1,
      limit: 10000, // High limit to get all products
      category: '', // No filters
      search: '',
      inStock: false
    });
    
    const products = response.products || [];
    
    if (products.length === 0) {
      alert('No products to export');
      return;
    }
    
    // Convert products to CSV format
    const csvData = convertProductsToCSV(products);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `products-export-${timestamp}.csv`;
    
    // Download the CSV file
    downloadCSV(csvData, filename);
    
  } catch (err) {
    console.error('Export failed:', err);
    setError('Failed to export products. Please try again.');
  } finally {
    setExportLoading(false); // Use export loading instead of main loading
  }
};

// Convert products array to CSV string
const convertProductsToCSV = (products) => {
  // Define CSV headers
  const headers = [
    'Name',
    'SKU', 
    'Category',
    'Subcategory',
    'Description',
    'THC %',
    'CBD %',
    'THC mg',
    'CBD mg',
    'Current Stock',
    'Stock Unit',
    'Low Stock Alert',
    'Pricing Options',
    'Effects',
    'Flavors',
    'Batch Number',
    'Lab Tested',
    'Licensed Producer',
    'Harvest Date',
    'Packaged Date',
    'Expiration Date',
    'State Tracking ID',
    'Supplier Name',
    'Supplier Contact',
    'Supplier License',
    'Active',
    'Available',
    'Created Date',
    'Images Count'
  ];
  
  // Convert products to CSV rows
  const rows = products.map(product => {
    // Format pricing options
    const pricingText = product.pricing?.map(p => 
      `${p.weight}g (${p.unit}) - $${p.price}`
    ).join('; ') || '';
    
    // Format effects and flavors
    const effectsText = product.effects?.join(', ') || '';
    const flavorsText = product.flavors?.join(', ') || '';
    
    // Format dates
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString();
      } catch {
        return dateStr;
      }
    };
    
    return [
      product.name || '',
      product.sku || '',
      product.category || '',
      product.subcategory || '',
      (product.description || '').replace(/,/g, ';'), // Replace commas to avoid CSV issues
      product.cannabinoids?.thcPercentage || '',
      product.cannabinoids?.cbdPercentage || '',
      product.cannabinoids?.thcMg || '',
      product.cannabinoids?.cbdMg || '',
      product.inventory?.currentStock || '',
      product.inventory?.unit || '',
      product.inventory?.lowStockAlert || '',
      pricingText.replace(/,/g, ';'), // Replace commas in pricing
      effectsText,
      flavorsText,
      product.compliance?.batchNumber || '',
      product.compliance?.labTested ? 'Yes' : 'No',
      product.compliance?.licensedProducer || '',
      formatDate(product.compliance?.harvestDate),
      formatDate(product.compliance?.packagedDate),
      formatDate(product.compliance?.expirationDate),
      product.compliance?.stateTrackingId || '',
      product.supplier?.name || '',
      product.supplier?.contact || '',
      product.supplier?.license || '',
      product.isActive ? 'Yes' : 'No',
      product.isAvailable ? 'Yes' : 'No',
      formatDate(product.createdAt),
      product.images?.length || 0
    ];
  });
  
  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
    
  return csvContent;
};

// Download CSV file
const downloadCSV = (csvContent, filename) => {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success alert (you can customize this)
    alert('Products exported successfully! Check your downloads folder.');
  }
};



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cannabis Product Catalog</h1>
          <p className="text-gray-600">Browse our selection of lab-tested cannabis products</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
{/* Export Products Button */}
          <button
            onClick={exportProducts}
            disabled={exportLoading} // Use exportLoading instead of loading
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {exportLoading ? ( // Use exportLoading instead of loading
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Products</span>
              </>
            )}
          </button>
          
          {/* Add New Product Button */}
          <button
            onClick={() => navigate('/products/new')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

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

