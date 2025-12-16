import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../services/productApi';
import Button from '../../components/ui/Button';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getProducts();
        setProducts(response.products || []);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Add New Product Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory</p>
          </div>
          
          {/* Add New Product Button */}
          <Button 
            variant="primary"
            onClick={() => navigate('/products/new')}
            className="bg-green-600 hover:bg-green-700"
          >
            + Add New Product
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.sku}</p>
                </div>
                
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.subcategory}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Stock: {product.inventory?.currentStock || 0} {product.inventory?.unit || 'units'}
                  </p>
                  {product.pricing && product.pricing.length > 0 && (
                    <p className="text-sm font-semibold text-green-600">
                      From ${Math.min(...product.pricing.map(p => p.price))}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => console.log('View details:', product._id)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No products found. Start by creating your first product.
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/products/new')}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Your First Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;