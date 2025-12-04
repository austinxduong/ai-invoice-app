import React, { useState, useEffect } from 'react';
import { productApi } from '../../services/productApi';
import ProductCard from './ProductCard';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    inStock: false
  });
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

  // Handle add to cart (placeholder for now)
  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    // TODO: Implement cart functionality
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cannabis Product Catalog</h1>
        <p className="text-gray-600">Browse our selection of lab-tested cannabis products</p>
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
    </div>
  );
};

export default ProductCatalog;

// import React, {useState, useEffect } from 'react'
// import {Search, Filter} from 'lucide-react';
// import { productApi, cannabisHelpers } from '../../services/productApi'
// import ProductCard from './ProductCard'

// const ProductCatalog = ({ onAddToCart }) => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedCategory, setSelectedCategory] = useState('all');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filters, setFilters] = useState({
//         subcategory:'',
//         inStock: false,
//         lowStock: false
//     });

// const categories = [
//     { key: 'all', label: 'All Products' },
//     { key: 'flower', label: '🌿 Flower' },
//     { key: 'edible', label: '🍪 Edibles' },
//     { key: 'concentrate', label: '🧪 Concentrates' },
//     { key: 'pre-roll', label: '🚬 Pre-Rolls' },
//     { key: 'topical', label: '🧴 Topicals' },
//     { key: 'accessory', label: '🛠️ Accessories' } 
// ];

// // fetch products based on currrent filters
// const fetchProducts = async () => {
//     try {
//         setLoading(true);
//         setError(null);

//         const apiFilters = {
//             ...(selectedCategory !== 'all' && { category:selectedCategory }),
//             ...(searchTerm && {search:searchTerm}),
//             ...(filters.subcategory && {subcategory: filters.subcategory }),
//             ...(filters.inStock && {inStock: true }),
//             ...(filters.lowStock && {lowStock:true}),
//             limit: 50,
//             sortBy:'name'
//         };

//         const response = await productApi.getProducts(apiFilters);
//         setProducts(response.products || []);
//     } catch (error) {
//         console.error('Error fetching products', error);
//         setError('Failed to load products. Please try again.')
//     } finally {
//         setLoading(false)
//     }
// }

// // initial load and refresh when filters change
// useEffect(() => {
//     fetchProducts();
// }, [selectedCategory, searchTerm, filters])

// const handleAddToCart = (product) => {
//     if (cannabisHelpers.isInStock(product)) {
//         onAddToCart(product);
//     }
// };

// const handleViewDetails = (product) => {
//     console.log('View product details:', product);
// };

// if (loading) {
//     return (
//         <div className="flex justify-center items-center h-96">
//             <div className="text-lg text-gray-600">Loading cannabis products...</div>
//         </div>
//     );
// }

// if (error) {
//     return (
//         <div className="flex justify-center items-center h-96">
//             <div className="text-lg text-red-600">{error}</div>
//         </div>
//     );
// }


//   return (
//     <div className="space-y-6">
//         {/* header */}
//         <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
//             <div className="text-sm text-gray-600">
//                 {products.length} product{products.length !== 1 ? 's': ''} available
//             </div>
//         </div>

//         {/* search bar */}
//     <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//         <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//         />
//     </div>

//         {/* category filter */}
//     <div className="flex space-x-2 overflow-x-auto pb-2">
//         {categories.map((category) => (
//             <button
//             key={category.key}
//             onClick={() => setSelectedCategory(category.key)}
//             className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
//                 selectedCategory === category.key
//                 ? 'bg-green-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//         >
//             {category.label}
//             </button>
//         ))}
//     </div>
        
//         {/* additional filters */}
//     <div className="flex space-x-4">
//         <label className="flex items-center space-x-2">
//             <input
//                 type="checkbox"
//                 checked={filters.inStock}
//                 onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
//                 className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//             />
//             <span className="text-sm text-gray-700">In Stock Only</span>
//         </label>
//         <label className="flex items-center space-x-2">
//             <input
//                 type="checkbox"
//                 checked={filters.lowStock}
//                 onChange={(e) => setFilters(prev => ({ ...prev, lowStock:e.target.checked }))}
//                 className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//             />
//             <span className="text-sm text-gray-700">Low Stock</span>
//         </label>
//     </div>

//         {/* products grid */}
//     {products.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {products.map((product) => (
//                 <ProductCard
//                     key={product._id}
//                     product={product}
//                     onAddToCart={handleAddToCart}
//                     onViewDetails={handleViewDetails}
//                 />
//             ))}
//         </div>
//     ) : (
//         <div className="text-center py-16">
//             <div className="text-6xl mb-4">🌿</div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//             <p className="text-gray-600">Try adjusting your search or filters</p>
//         </div>
//     )}
//     </div>     
//   );
// };

// export default ProductCatalog