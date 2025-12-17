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


  // Export products to CSV
const exportProducts = async () => {
  try {
    setLoading(true);
    
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
    setLoading(false);
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
    
    // Show success message
    const successElement = document.getElementById('export-success');
    if (successElement) {
      successElement.classList.remove('hidden');
      // Hide after 5 seconds
      setTimeout(() => {
        successElement.classList.add('hidden');
      }, 5000);
    }
  }
};

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
        </div>

                {/* Export Success Message */}
        <div id="export-success" className="hidden mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 text-sm font-medium">
              Products exported successfully! Check your downloads folder.
            </p>
          </div>
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