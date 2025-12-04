import React, {useState, useEffect } from 'react'
import {Search, Filter} from 'lucide-react';
import { productApi, cannabisHelpers } from '../../services/productApi'
import ProductCard from './ProductCard'

const ProductCatalog = ({ onAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        subcategory:'',
        inStock: false,
        lowStock: false
    });

const categories = [
    { key: 'all', label: 'All Products' },
    { key: 'flower', label: '🌿 Flower' },
    { key: 'edible', label: '🍪 Edibles' },
    { key: 'concentrate', label: '🧪 Concentrates' },
    { key: 'pre-roll', label: '🚬 Pre-Rolls' },
    { key: 'topical', label: '🧴 Topicals' },
    { key: 'accessory', label: '🛠️ Accessories' } 
];

// fetch products based on currrent filters
const fetchProducts = async () => {
    try {
        setLoading(true);
        setError(null);

        const apiFilters = {
            ...(selectedCategory !== 'all' && { category:selectedCategory }),
            ...(searchTerm && {search:searchTerm}),
            ...(filters.subcategory && {subcategory: filters.subcategory }),
            ...(filters.inStock && {inStock: true }),
            ...(filters.lowStock && {lowStock:true}),
            limit: 50,
            sortBy:'name'
        };

        const response = await productApi.getProducts(apiFilters);
        setProducts(response.products || []);
    } catch (error) {
        console.error('Error fetching products', error);
        setError('Failed to load products. Please try again.')
    } finally {
        setLoading(false)
    }
}

// initial load and refresh when filters change
useEffect(() => {
    fetchProducts();
}, [selectedCategory, searchTerm, filters])

const handleAddToCart = (product) => {
    if (cannabisHelpers.isInStock(product)) {
        onAddToCart(product);
    }
};

const handleViewDetails = (product) => {
    console.log('View product details:', product);
};

if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <div className="text-lg text-gray-600">Loading cannabis products...</div>
        </div>
    );
}

if (error) {
    return (
        <div className="flex justify-center items-center h-96">
            <div className="text-lg text-red-600">{error}</div>
        </div>
    );
}


  return (
    <div className="space-y-6">
        {/* header */}
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
            <div className="text-sm text-gray-600">
                {products.length} product{products.length !== 1 ? 's': ''} available
            </div>
        </div>

        {/* search bar */}
    <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
    </div>

        {/* category filter */}
    <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
            <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
            {category.label}
            </button>
        ))}
    </div>
        
        {/* additional filters */}
    <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
            <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
        <label className="flex items-center space-x-2">
            <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => setFilters(prev => ({ ...prev, lowStock:e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Low Stock</span>
        </label>
    </div>

        {/* products grid */}
    {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                />
            ))}
        </div>
    ) : (
        <div className="text-center py-16">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
    )}
    </div>     
  );
};

export default ProductCatalog