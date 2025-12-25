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
  const [showImportModal, setShowImportModal] = useState(false); 
  const [importData, setImportData] = useState([]); 
  const [importLoading, setImportLoading] = useState(false); 
  const [importStep, setImportStep] = useState('upload'); 
  const [validationErrors, setValidationErrors] = useState({}); 
  const [duplicates, setDuplicates] = useState([]); 
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
  { value: 'pre-rolls', label: "Pre-Rolls"},
  { value: 'edibles', label: 'Edibles' },           // ✅ Fixed
  { value: 'concentrates', label: 'Concentrates' }, // ✅ Fixed
  { value: 'topicals', label: 'Topicals' },        // ✅ Fixed
  { value: 'accessories', label: 'Accessories' },   // ✅ Fixed
  { value: 'other', label: 'Other' }               // ✅ Added
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

const convertProductsToCSV = (products) => {
  const headers = [
    'Name', 'SKU', 'Category', 'Subcategory', 'Description',
    'THC %', 'CBD %', 'THC mg', 'CBD mg',
    'Current Stock', 'Stock Unit', 'Low Stock Alert',
    'Pricing Options', 'Effects', 'Flavors',
    'Batch Number', 'Lab Tested', 'Licensed Producer',
    'Harvest Date', 'Packaged Date', 'Expiration Date',
    'State Tracking ID', 'Supplier Name', 'Supplier Contact',
    'Supplier License', 'Active', 'Available', 'Created Date', 'Images Count'
  ];
  
  const rows = products.map(product => {
    // ✅ Format pricing options
    const pricingText = product.pricing?.map(p => 
      `${p.weight}g (${p.unit}) - $${p.price}`
    ).join('; ') || '';
    
    // ✅ Format effects and flavors
    const effectsText = product.effects?.join(', ') || '';
    const flavorsText = product.flavors?.join(', ') || '';
    
    // ✅ Format dates
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString();
      } catch {
        return '';
      }
    };
    
    return [
      product.name || '',
      product.sku || '',
      product.category || '',
      product.subcategory || '',
      (product.description || '').replace(/,/g, ';'),
      product.thcContent || '',              // ✅ NEW schema
      product.cbdContent || '',              // ✅ NEW schema
      '',                                     // THC mg (not in new schema)
      '',                                     // CBD mg (not in new schema)
      product.stockQuantity || '',           // ✅ NEW schema
      product.unit || '',                    // ✅ NEW schema
      product.lowStockThreshold || '',       // ✅ NEW schema
      pricingText,
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


// Import products from CSV
const handleImportClick = () => {
  setShowImportModal(true);
  setImportStep('upload');
  setImportData([]);
  setValidationErrors({});
  setDuplicates([]);
};

const closeImportModal = () => {
  setShowImportModal(false);
  setImportStep('upload');
  setImportData([]);
  setValidationErrors({});
  setDuplicates([]);
};

// Handle CSV file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.name.endsWith('.csv')) {
    alert('Please upload a CSV file');
    return;
  }

  // Read the CSV file
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csv = e.target.result;
      const parsedData = parseCSV(csv);
      
      if (parsedData.length === 0) {
        alert('The CSV file appears to be empty');
        return;
      }
      
      setImportData(parsedData);
      setImportStep('validate');
      validateImportData(parsedData);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error reading CSV file. Please check the file format.');
    }
  };
  
  reader.readAsText(file);
};

const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return []; // Need at least header + 1 data row
  
  // ✅ Parse CSV line respecting quotes
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Push last field
    result.push(current.trim());
    
    return result;
  };
  
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < headers.length) continue; // Skip incomplete rows
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Convert to product format
    const product = convertRowToProduct(row, i);
    if (product) data.push(product);
  }
  
  return data;
};

// ✅ UPDATED: Transform CSV product data to match Product model with PRICING ARRAY
const transformProductForModel = (csvProduct) => {
  // Map CSV categories to Product model enum values
  const categoryMap = {
    'edible': 'edibles',
    'concentrate': 'concentrates',
    'pre-roll': 'accessories',
    'topical': 'topicals',
    'flower': 'flower',
    'accessory': 'accessories'
  };
  
  // Map CSV units to Product model enum values
  const unitMap = {
    'each': 'each',
    'gram': 'gram',
    'g': 'gram',
    'eighth': 'eighth',
    'quarter': 'quarter',
    'half': 'half',
    'oz': 'ounce',
    'ounce': 'ounce',
    'lb': 'pound',
    'pound': 'pound',
    'kg': 'kilogram',
    'kilogram': 'kilogram',
    'l': 'liter',
    'liter': 'liter',
    'ml': 'milliliter',
    'milliliter': 'milliliter',
    'package': 'package',
    'unit': 'unit'
  };
  
  // ✅ PRESERVE ALL PRICING OPTIONS
  let pricingArray = [];
  
  if (csvProduct.pricing && csvProduct.pricing.length > 0) {
    // Map all pricing options from CSV
    pricingArray = csvProduct.pricing.map(p => ({
      unit: unitMap[p.unit?.toLowerCase()] || 'unit',
      weight: p.weight || 1,
      price: p.price || 0
    }));
  } else {
    // Fallback: create single pricing option
    pricingArray = [{
      unit: 'unit',
      weight: 1,
      price: 0
    }];
  }
  
  // Get inventory unit and map to valid enum
  const csvUnit = (csvProduct.inventory?.unit || 'unit').toLowerCase();
  const validUnit = unitMap[csvUnit] || 'unit';
  
  // Parse effects and flavors
  const effects = csvProduct.effects || [];
  const flavors = csvProduct.flavors || [];

  const parseDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return null;
  try {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};
  
  // Transform to match Product.js model structure
  return {
    name: csvProduct.name,
    sku: csvProduct.sku,
    description: csvProduct.description || '',
    
    // Fix category enum
    category: categoryMap[csvProduct.category?.toLowerCase()] || 'other',
    subcategory: csvProduct.subcategory || '',
    
    // ✅ Multiple pricing options
    pricing: pricingArray,
    
    // Cost
    cost: 0,  // Default cost
    
    // Map inventory structure with VALID unit
    stockQuantity: csvProduct.inventory?.currentStock || 0,
    lowStockThreshold: csvProduct.inventory?.lowStockAlert || 10,
    unit: validUnit,
    
    // Cannabis-specific fields
    thcContent: csvProduct.cannabinoids?.thcPercentage || null,
    cbdContent: csvProduct.cannabinoids?.cbdPercentage || null,
    strain: csvProduct.name,
    strainType: csvProduct.subcategory === 'indica' ? 'indica' : 
                csvProduct.subcategory === 'sativa' ? 'sativa' :
                csvProduct.subcategory === 'hybrid' ? 'hybrid' : null,
    
    // Additional cannabis fields
    effects: effects,
    flavors: flavors,
    
    // Compliance
    compliance: {
      batchNumber: csvProduct.compliance?.batchNumber || '',
      labTested: csvProduct.compliance?.labTested || false,
      licensedProducer: csvProduct.compliance?.licensedProducer || '',
      harvestDate: parseDate(csvProduct.compliance?.harvestDate),     // ✅ Use parseDate!
      packagedDate: parseDate(csvProduct.compliance?.packagedDate),   // ✅ Use parseDate!
      expirationDate: parseDate(csvProduct.compliance?.expirationDate), // ✅ Use parseDate!
      stateTrackingId: csvProduct.compliance?.stateTrackingId || ''
    },
    
    // Supplier
    supplier: {
      name: csvProduct.supplier?.name || '',
      contact: csvProduct.supplier?.contact || '',
      license: csvProduct.supplier?.license || ''
    },
    
    // Status
    isActive: csvProduct.isActive !== false,
    isAvailable: csvProduct.isAvailable !== false,
    
    // Images (if any)
    images: csvProduct.images || []
  };
};

// ✅ CORRECTED convertRowToProduct - Reads CSV columns in the right order

const convertRowToProduct = (row, rowIndex) => {
  try {
    return {
      rowIndex,
      name: row['Name'] || '',
      sku: row['SKU'] || '',
      category: row['Category']?.toLowerCase() || '',
      subcategory: row['Subcategory']?.toLowerCase() || '',
      description: row['Description'] || '',
      cannabinoids: {
        thcPercentage: parseFloat(row['THC %']) || 0,
        cbdPercentage: parseFloat(row['CBD %']) || 0,
        thcMg: parseFloat(row['THC mg']) || 0,
        cbdMg: parseFloat(row['CBD mg']) || 0,
      },
      inventory: {
        currentStock: parseInt(row['Current Stock']) || 0,
        unit: row['Stock Unit']?.toLowerCase() || 'each',
        lowStockAlert: parseInt(row['Low Stock Alert']) || 5,
      },
      pricing: parsePricingOptions(row['Pricing Options']),
      effects: row['Effects'] ? row['Effects'].split(',').map(e => e.trim().toLowerCase()) : [],
      flavors: row['Flavors'] ? row['Flavors'].split(',').map(f => f.trim()) : [],
      
      // ✅ FIX: Compliance fields in correct order
      compliance: {
        batchNumber: row['Batch Number'] || '',
        labTested: row['Lab Tested']?.toLowerCase() === 'yes',
        licensedProducer: row['Licensed Producer'] || '',
        harvestDate: row['Harvest Date'] || '',        // ← Correct column
        packagedDate: row['Packaged Date'] || '',      // ← Correct column
        expirationDate: row['Expiration Date'] || '',  // ← Correct column
        stateTrackingId: row['State Tracking ID'] || '',
      },
      
      // ✅ FIX: Supplier fields
      supplier: {
        name: row['Supplier Name'] || '',
        contact: row['Supplier Contact'] || '',
        license: row['Supplier License'] || '',
      },
      
      isActive: row['Active']?.toLowerCase() !== 'no',
      isAvailable: row['Available']?.toLowerCase() !== 'no',
    };
  } catch (error) {
    console.error('Error converting row to product:', error);
    return null;
  }
};

// Parse pricing options from CSV format
const parsePricingOptions = (pricingText) => {
  if (!pricingText) return [{ unit: 'gram', weight: 1, price: 0 }];
  
  try {
    const options = pricingText.split(';').map(option => {
      // Match patterns like "1g (gram) - $18" or "3.5g (eighth) - $55"
      const match = option.match(/(\d+\.?\d*)g\s*\((\w+)\)\s*-\s*\$(\d+\.?\d*)/);
      if (match) {
        return {
          weight: parseFloat(match[1]),
          unit: match[2].toLowerCase(),
          price: parseFloat(match[3]),
        };
      }
      return null;
    }).filter(Boolean);
    
    return options.length > 0 ? options : [{ unit: 'gram', weight: 1, price: 0 }];
  } catch (error) {
    return [{ unit: 'gram', weight: 1, price: 0 }];
  }
};


// ✅ DEBUG VERSION: Add logging to see what's being parsed
const convertRowToProductDebug = (row, rowIndex) => {
  console.log('🔍 CSV Row:', {
    'Batch Number': row['Batch Number'],
    'Lab Tested': row['Lab Tested'],
    'Licensed Producer': row['Licensed Producer'],
    'Harvest Date': row['Harvest Date'],
    'Packaged Date': row['Packaged Date'],
    'Expiration Date': row['Expiration Date']
  });
  
  return convertRowToProduct(row, rowIndex);
};


// Validate import data
const validateImportData = async (data) => {
  setImportLoading(true);
  const errors = {};
  const duplicateList = [];
  
  try {
    // Get existing products to check for duplicates
    const existingResponse = await productApi.getProducts({ limit: 10000 });
    const existingProducts = existingResponse.products || [];
    const existingSkus = new Set(existingProducts.map(p => p.sku.toLowerCase()));
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));
    
    data.forEach((product, index) => {
      const rowErrors = [];
      
      // Required field validation
      if (!product.name?.trim()) {
        rowErrors.push('Name is required');
      }
      
      if (!product.sku?.trim()) {
        rowErrors.push('SKU is required');
      }
      
      if (!product.category?.trim()) {
        rowErrors.push('Category is required');
      } else {
        // Validate category enum
        const validCategories = ['flower', 'edible', 'concentrate', 'topical', 'accessory', 'pre-roll'];
        if (!validCategories.includes(product.category)) {
          rowErrors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }
      }
      
      if (!product.compliance?.batchNumber?.trim()) {
        rowErrors.push('Batch Number is required');
      }
      
      // Pricing validation
      if (!product.pricing || product.pricing.length === 0 || 
          !product.pricing.some(p => p.weight > 0 && p.price > 0)) {
        rowErrors.push('At least one valid pricing option is required');
      }
      
      // Check for duplicates
      const isDuplicateSku = existingSkus.has(product.sku?.toLowerCase());
      const isDuplicateName = existingNames.has(product.name?.toLowerCase());
      
      if (isDuplicateSku || isDuplicateName) {
        const existingProduct = existingProducts.find(p => 
          p.sku.toLowerCase() === product.sku?.toLowerCase() || 
          p.name.toLowerCase() === product.name?.toLowerCase()
        );
        
        duplicateList.push({
          rowIndex: index,
          importProduct: product,
          existingProduct,
          action: 'skip', // Default action
          matchType: isDuplicateSku ? 'SKU' : 'Name'
        });
      }
      
      if (rowErrors.length > 0) {
        errors[index] = rowErrors;
      }
    });
    
    setValidationErrors(errors);
    setDuplicates(duplicateList);
    
  } catch (error) {
    console.error('Error validating import data:', error);
    setError('Error validating import data');
  } finally {
    setImportLoading(false);
  }
};

// Handle duplicate action change
const handleDuplicateAction = (rowIndex, action) => {
  setDuplicates(prev => 
    prev.map(dup => 
      dup.rowIndex === rowIndex ? { ...dup, action } : dup
    )
  );
};

// Process final import
const handleFinalImport = async () => {
  setImportLoading(true);
  
  try {
    // Prepare products for bulk import
    const productsToImport = [];
    const productsToUpdate = [];
    
    for (let i = 0; i < importData.length; i++) {
      // Skip rows with validation errors
      if (validationErrors[i]) {
        continue;
      }
      
      const product = importData[i];
      const duplicate = duplicates.find(d => d.rowIndex === i);
      
      // Skip if duplicate and action is skip
      if (duplicate && duplicate.action === 'skip') {
        continue;
      }
      
      // ✅ Transform product data to match current model
      const transformedProduct = transformProductForModel(product);
      
      // ✅ Use transformedProduct, not product!
      const productData = {
        ...transformedProduct  // ← FIXED: Use transformed data
      };
      
      if (duplicate && duplicate.action === 'replace') {
        // Add to update list
        productsToUpdate.push({
          id: duplicate.existingProduct._id,
          data: productData
        });
      } else {
        // Add to create list
        productsToImport.push(productData);
      }
    }
    
    // 🐛 DEBUG - Now it's AFTER creating the array
    if (productsToImport.length > 0) {
      console.log('🔍 First product being sent:', productsToImport[0]);
      console.log('🔍 Category:', productsToImport[0].category);
      console.log('🔍 Price:', productsToImport[0].price);
      console.log('🔍 SKU:', productsToImport[0].sku);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Bulk import new products
    if (productsToImport.length > 0) {
      console.log(`📦 Bulk importing ${productsToImport.length} new products...`);
      try {
        const result = await productApi.bulkImportProducts(productsToImport);
        successCount += result.successCount || 0;
        errorCount += result.errorCount || 0;
        console.log('✅ Bulk import result:', result);
      } catch (error) {
        console.error('❌ Bulk import failed:', error);
        errorCount += productsToImport.length;
      }
    }
    
    // Update existing products (one by one for now)
    for (const update of productsToUpdate) {
      try {
        await productApi.updateProduct(update.id, update.data);
        successCount++;
      } catch (error) {
        console.error('Error updating product:', error);
        errorCount++;
      }
    }
    
    // Show results
    let message = `Import completed!\n${successCount} products imported successfully.`;
    if (errorCount > 0) {
      message += `\n${errorCount} products had errors.`;
    }
    
    alert(message);
    
    // Reload products and close modal
    closeImportModal();
    loadProducts();
    
  } catch (error) {
    console.error('Error during final import:', error);
    setError('Error during import process');
  } finally {
    setImportLoading(false);
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

        {/* Import Products Modal */}
{showImportModal && (
  <div className="fixed inset-0 z-50 overflow-hidden">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
      onClick={closeImportModal}
    />
    
    {/* Modal */}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Import Products</h2>
          <button
            onClick={closeImportModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Step 1: File Upload */}
          {importStep === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h3>
                <p className="text-gray-600 mb-4">
                  Upload a CSV file with your product data. Make sure to include all required fields.
                </p>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-lg font-medium text-gray-900 mb-2">Click to upload CSV file</div>
                  <div className="text-sm text-gray-600">or drag and drop your file here</div>
                </label>
              </div>

              {/* CSV Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Need a template?</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Download our CSV template to ensure your data is formatted correctly.
                    </p>
                    <button
                      onClick={() => {
                        // Create and download a template CSV
                        const templateHeaders = [
                          'Name', 'SKU', 'Category', 'Subcategory', 'Description', 
                          'THC %', 'CBD %', 'THC mg', 'CBD mg',
                          'Current Stock', 'Stock Unit', 'Low Stock Alert',
                          'Pricing Options', 'Effects', 'Flavors',
                          'Batch Number', 'Lab Tested', 'Licensed Producer',
                          'Harvest Date', 'Packaged Date', 'Expiration Date',
                          'State Tracking ID', 'Supplier Name', 'Supplier Contact',
                          'Supplier License', 'Active', 'Available'
                        ];
                        const exampleRow = [
                          'Purple Kush', 'FL-IN-PUR-001', 'flower', 'indica', 'Premium indoor grown Purple Kush strain',
                          '22.5', '0.3', '', '',
                          '100', 'gram', '10',
                          '3.5g (eighth) - $35; 7g (quarter) - $65', 'relaxed, euphoric, sleepy', 'earthy, sweet',
                          'PK-2024-001', 'Yes', 'Premium Cannabis Co',
                          '2024-01-15', '2024-02-01', '2025-02-01',
                          'CA123456789', 'Premium Suppliers Inc', 'contact@premiumsuppliers.com',
                          'LICENSE-12345', 'Yes', 'Yes'
                        ];
                        const csvContent = [templateHeaders, exampleRow]
                          .map(row => row.map(field => `"${field}"`).join(','))
                          .join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'product-import-template.csv';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Validation & Review */}
          {importStep === 'validate' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Review Import Data</h3>
                  <p className="text-gray-600">
                    {importData.length} products found. Review and fix any issues before importing.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setImportStep('upload')}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setImportStep('confirm')}
                    disabled={Object.keys(validationErrors).length > 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Continue to Import
                  </button>
                </div>
              </div>

              {/* Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-medium">Valid Products</div>
                  <div className="text-2xl font-bold text-green-900">
                    {importData.length - Object.keys(validationErrors).length}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 font-medium">Validation Errors</div>
                  <div className="text-2xl font-bold text-red-900">
                    {Object.keys(validationErrors).length}
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-yellow-800 font-medium">Duplicates Found</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {duplicates.length}
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-red-800 mb-3">Products with Validation Errors</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(validationErrors).map(([rowIndex, errors]) => {
                      const product = importData[parseInt(rowIndex)];
                      return (
                        <div key={rowIndex} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div>
                            <div className="font-medium text-gray-900">
                              Row {parseInt(rowIndex) + 2}: {product?.name || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-red-600">
                              {errors.join(', ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Duplicate Handling */}
              {duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-3">Duplicate Products Found</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {duplicates.map((duplicate, index) => (
                      <div key={index} className="bg-white p-4 rounded border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              Row {duplicate.rowIndex + 2}: {duplicate.importProduct.name}
                            </div>
                            <div className="text-sm text-yellow-700">
                              Matches existing product by {duplicate.matchType}: "{duplicate.existingProduct.name}"
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`duplicate-${index}`}
                              value="skip"
                              checked={duplicate.action === 'skip'}
                              onChange={() => handleDuplicateAction(duplicate.rowIndex, 'skip')}
                              className="mr-2"
                            />
                            <span className="text-sm">Skip (don't import this product)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`duplicate-${index}`}
                              value="replace"
                              checked={duplicate.action === 'replace'}
                              onChange={() => handleDuplicateAction(duplicate.rowIndex, 'replace')}
                              className="mr-2"
                            />
                            <span className="text-sm">Replace (overwrite existing product with new data)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`duplicate-${index}`}
                              value="add"
                              checked={duplicate.action === 'add'}
                              onChange={() => handleDuplicateAction(duplicate.rowIndex, 'add')}
                              className="mr-2"
                            />
                            <span className="text-sm">Add as duplicate (create new product with different SKU)</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Products Preview */}
              {importData.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Products Ready to Import</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-60">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {importData.map((product, index) => {
                            const hasError = validationErrors[index];
                            const isDuplicate = duplicates.find(d => d.rowIndex === index);
                            
                            return (
                              <tr key={index} className={hasError ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                <td className="px-3 py-2 text-sm text-gray-900">{index + 2}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">{product.name}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">{product.sku}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">{product.category}</td>
                                <td className="px-3 py-2 text-sm">
                                  {hasError && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Errors
                                    </span>
                                  )}
                                  {isDuplicate && !hasError && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Duplicate ({isDuplicate.action})
                                    </span>
                                  )}
                                  {!hasError && !isDuplicate && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Ready
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {importStep === 'confirm' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Import</h3>
                <p className="text-gray-600">
                  Review the final import summary before proceeding.
                </p>
              </div>

              {/* Final Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">Import Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total products to import:</span>
                    <span className="font-bold ml-2">
                      {importData.length - Object.keys(validationErrors).length - duplicates.filter(d => d.action === 'skip').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">New products:</span>
                    <span className="font-bold ml-2">
                      {importData.length - Object.keys(validationErrors).length - duplicates.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Products to replace:</span>
                    <span className="font-bold ml-2">
                      {duplicates.filter(d => d.action === 'replace').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Products to add as duplicates:</span>
                    <span className="font-bold ml-2">
                      {duplicates.filter(d => d.action === 'add').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setImportStep('validate')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Review
                </button>
                <button
                  onClick={handleFinalImport}
                  disabled={importLoading}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  {importLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import Products</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

        
        
        {/* Action Buttons */}
        <div className="flex space-x-3">

        {/* Import Products Button */}
          <button
            onClick={handleImportClick}
            disabled={importLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {importLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import Products</span>
              </>
            )}
          </button>

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
  {/* ✅ COMPLETE PRODUCT DETAIL MODAL - Replace entire modal section */}
{showDetailModal && selectedProduct && (
  <div className="fixed inset-0 z-50 overflow-hidden">
    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeDetailModal} />
    
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button onClick={closeDetailModal} className="p-2 hover:bg-gray-100 rounded-full">
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
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <Package className="h-16 w-16 text-green-600" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h3>
              
              {/* ✅ Category & Subcategory with Labels */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Category</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                      {selectedProduct.category}
                    </span>
                  </div>
                </div>
                {selectedProduct.subcategory && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Subcategory</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        {selectedProduct.subcategory}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">SKU:</span> {selectedProduct.sku}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Stock:</span> {selectedProduct.stockQuantity || 0} {selectedProduct.unit || 'units'}
                </div>
              </div>
            </div>

            {/* ✅ Cannabinoids with THC/CBD mg */}
            {(selectedProduct.thcContent > 0 || selectedProduct.cbdContent > 0) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Cannabinoid Profile
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProduct.thcContent > 0 && (
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase mb-1">THC</span>
                      <div className="text-lg font-bold text-green-600">{selectedProduct.thcContent}%</div>
                      {selectedProduct.thcMg > 0 && (
                        <div className="text-xs text-gray-600">{selectedProduct.thcMg}mg</div>
                      )}
                    </div>
                  )}
                  {selectedProduct.cbdContent > 0 && (
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase mb-1">CBD</span>
                      <div className="text-lg font-bold text-blue-600">{selectedProduct.cbdContent}%</div>
                      {selectedProduct.cbdMg > 0 && (
                        <div className="text-xs text-gray-600">{selectedProduct.cbdMg}mg</div>
                      )}
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
                      className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 capitalize"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Flavors */}
            {selectedProduct.flavors?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Flavors</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.flavors.map((flavor, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-pink-100 text-pink-800 capitalize"
                    >
                      {flavor}
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
                <h4 className="font-semibold text-gray-900 mb-3">Compliance Information</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  {selectedProduct.compliance.batchNumber && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Batch Number:</span>
                      <span>{selectedProduct.compliance.batchNumber}</span>
                    </div>
                  )}
                  {selectedProduct.compliance.labTested !== undefined && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Lab Tested:</span>
                      <span>{selectedProduct.compliance.labTested ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {selectedProduct.compliance.licensedProducer && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Licensed Producer:</span>
                      <span>{selectedProduct.compliance.licensedProducer}</span>
                    </div>
                  )}
                  {selectedProduct.compliance.harvestDate && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Harvest Date:</span>
                      <span>{new Date(selectedProduct.compliance.harvestDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedProduct.compliance.packagedDate && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Packaged:</span>
                      <span>{new Date(selectedProduct.compliance.packagedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedProduct.compliance.expirationDate && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Expires:</span>
                      <span>{new Date(selectedProduct.compliance.expirationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedProduct.compliance.stateTrackingId && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">State Tracking ID:</span>
                      <span className="break-all">{selectedProduct.compliance.stateTrackingId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Supplier Info */}
            {selectedProduct.supplier?.name && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Supplier Information</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-36">Name:</span>
                    <span>{selectedProduct.supplier.name}</span>
                  </div>
                  {selectedProduct.supplier.contact && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">Contact:</span>
                      <span>{selectedProduct.supplier.contact}</span>
                    </div>
                  )}
                  {selectedProduct.supplier.license && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-36">License:</span>
                      <span>{selectedProduct.supplier.license}</span>
                    </div>
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
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleAddToCart(selectedProduct);
                closeDetailModal();
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
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


