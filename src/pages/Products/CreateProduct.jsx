import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { createProduct } from '../../utils/productApi';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextareaField from '../../components/ui/TextareaField';
import Button from '../../components/ui/Button';
import productApi from '../../services/productApi';

const CreateProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});

  // Validation rules
const validateForm = () => {
  const errors = {};
  
  // Basic Info Validation
  if (!formData.name?.trim()) {
    errors.name = 'Product name is required';
  }
  
  if (!formData.sku?.trim()) {
    errors.sku = 'SKU is required';
  }
  
  if (!formData.category) {
    errors.category = 'Category is required';
  }
  
  // For flower, edible, concentrate, and pre-roll - subcategory is required
  const categoriesRequiringSubcategory = ['flower', 'edible', 'concentrate', 'pre-roll'];
  if (categoriesRequiringSubcategory.includes(formData.category) && !formData.subcategory) {
    errors.subcategory = 'Subcategory is required for this product type';
  }
  
  // Compliance Validation
  if (!formData.compliance.batchNumber?.trim()) {
    errors['compliance.batchNumber'] = 'Batch number is required';
  }
  
  // Pricing Validation - at least one valid pricing option required
  const validPricingOptions = formData.pricing.filter(p => p.weight && p.price && p.weight > 0 && p.price > 0);
  if (validPricingOptions.length === 0) {
    errors.pricing = 'At least one pricing option with weight and price is required';
  }
  
  // Inventory Validation
  if (formData.inventory.currentStock === '' || formData.inventory.currentStock < 0) {
    errors['inventory.currentStock'] = 'Current stock must be 0 or greater';
  }
  
  return errors;
};

// Real-time validation when fields change
const validateField = (fieldPath, value) => {
  const errors = { ...validationErrors };
  
  // Remove existing error if field becomes valid
  delete errors[fieldPath];
  
  // Basic validations
  if (fieldPath === 'name' && !value?.trim()) {
    errors.name = 'Product name is required';
  }
  
  if (fieldPath === 'sku' && !value?.trim()) {
    errors.sku = 'SKU is required';
  }
  
  if (fieldPath === 'category' && !value) {
    errors.category = 'Category is required';
  }
  
  if (fieldPath === 'subcategory') {
    const categoriesRequiringSubcategory = ['flower', 'edible', 'concentrate', 'pre-roll'];
    if (categoriesRequiringSubcategory.includes(formData.category) && !value) {
      errors.subcategory = 'Subcategory is required for this product type';
    }
  }
  
  if (fieldPath === 'compliance.batchNumber' && !value?.trim()) {
    errors['compliance.batchNumber'] = 'Batch number is required';
  }
  
  setValidationErrors(errors);
};

// Validate specific sections
const validateSection = (sectionId) => {
  const errors = {};
  
  switch (sectionId) {
    case 'basic':
      if (!formData.name?.trim()) {
        errors.name = 'Product name is required';
      }
      
      if (!formData.sku?.trim()) {
        errors.sku = 'SKU is required';
      }
      
      if (!formData.category) {
        errors.category = 'Category is required';
      }
      
      // For flower, edible, concentrate, and pre-roll - subcategory is required
      const categoriesRequiringSubcategory = ['flower', 'edible', 'concentrate', 'pre-roll'];
      if (categoriesRequiringSubcategory.includes(formData.category) && !formData.subcategory) {
        errors.subcategory = 'Subcategory is required for this product type';
      }
      break;
      
    case 'pricing':
      // Pricing Validation - at least one valid pricing option required
      const validPricingOptions = formData.pricing.filter(p => p.weight && p.price && p.weight > 0 && p.price > 0);
      if (validPricingOptions.length === 0) {
        errors.pricing = 'At least one pricing option with weight and price is required';
      }
      
      // Inventory Validation
      if (formData.inventory.currentStock === '' || formData.inventory.currentStock < 0) {
        errors['inventory.currentStock'] = 'Current stock must be 0 or greater';
      }
      break;
      
    case 'compliance':
      if (!formData.compliance.batchNumber?.trim()) {
        errors['compliance.batchNumber'] = 'Batch number is required';
      }
      break;
      
    // No validation needed for cannabinoids and details sections
    case 'cannabinoids':
    case 'details':
    default:
      break;
  }
  
  return errors;
};

// Check if current section is valid
const isSectionValid = (sectionId) => {
  const sectionErrors = validateSection(sectionId);
  return Object.keys(sectionErrors).length === 0;
};

// Helper function to convert field paths to display names
const getFieldDisplayName = (fieldPath) => {
  const displayNames = {
    'name': 'Product Name',
    'sku': 'SKU',
    'category': 'Category',
    'subcategory': 'Subcategory',
    'compliance.batchNumber': 'Batch Number',
    'pricing': 'Pricing Options',
    'inventory.currentStock': 'Current Stock'
  };
  return displayNames[fieldPath] || fieldPath;
}

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    description: '',
    
    // Cannabinoids
    cannabinoids: {
      thcPercentage:'',
      cbdPercentage:'',
      thcMg: '',
      cbdMg: ''
    },
    
    // Pricing (array of pricing options)
    pricing: [{ unit: 'gram', weight: '', price: '' }],
    
    // Inventory
    inventory: {
      currentStock:'',
      unit: 'each',
      lowStockAlert: 5
    },
    
    // Product Details
    effects: [],
    flavors: [],
    
    // Compliance
    compliance: {
      batchNumber: '',
      labTested: false,
      testResults: {
        lab: '',
        passedTest: false,
        pesticides: false,
        residualSolvents: false,
        heavyMetals: false,
        microbials: false
      },
      harvestDate: '',
      packagedDate: '',
      expirationDate: '',
      licensedProducer: '',
      stateTrackingId: ''
    },
    
    // Supplier
    supplier: {
      name: '',
      contact: '',
      license: ''
    },
    
    // Status
    isActive: true,
    isAvailable: true,
    
    // Images
    images: []
  });

  // Constants for dropdowns
  const categories = ['flower', 'edible', 'concentrate', 'topical', 'accessory', 'pre-roll'];
  const subcategories = ['indica', 'sativa', 'hybrid', 'cbd', 'high-cbd', 'balanced', 'other'];
  const units = ['gram', 'eighth', 'quarter', 'half', 'ounce', 'each', 'package'];
  const inventoryUnits = ['gram', 'each', 'package'];
  const availableEffects = ['relaxed', 'euphoric', 'uplifted', 'creative', 'focused', 'sleepy', 'energetic', 'happy'];

  // Sections for navigation
  const sections = [
    { id: 'basic', name: 'Basic Info', icon: '📝' },
    { id: 'cannabinoids', name: 'Cannabinoids', icon: '🧪' },
    { id: 'pricing', name: 'Pricing', icon: '💰' },
    { id: 'details', name: 'Details', icon: '📋' },
    { id: 'compliance', name: 'Compliance', icon: '🔒' },
    { id: 'review', name: 'Review', icon: '👁️' }
  ];

// Handle form field updates with validation
const updateField = (path, value) => {
  setFormData(prev => {
    const newData = { ...prev };
    const keys = path.split('.');
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    // Convert to number if it's a numeric field and not empty
    const fieldName = keys[keys.length - 1];
    const numericFields = [
      'thcPercentage', 'cbdPercentage', 'thcMg', 'cbdMg', 
      'currentStock', 'lowStockAlert', 'weight', 'price'
    ];
    
    if (numericFields.includes(fieldName) && value !== '') {
      current[fieldName] = Number(value);
    } else {
      current[fieldName] = value;
    }
    
    return newData;
  });
  
  // Validate field in real-time
  validateField(path, value);
};

// Auto-generate SKU
const generateSKU = () => {
  if (!formData.name || !formData.category) {
    alert('Please enter a product name and select a category first');
    return;
  }

  const categoryCode = {
    'flower': 'FL',
    'edible': 'ED', 
    'concentrate': 'CN',
    'topical': 'TP',
    'accessory': 'AC',
    'pre-roll': 'PR'
  }[formData.category];
  
  const subcategoryCode = formData.subcategory 
    ? formData.subcategory.substring(0, 2).toUpperCase() 
    : 'GN'; // Generic if no subcategory
  
  const nameCode = formData.name
    .replace(/[^A-Za-z]/g, '') // Remove non-letters
    .substring(0, 3)
    .toUpperCase();
  
  const timestamp = Date.now().toString().slice(-3);
  
  const generatedSKU = `${categoryCode}-${subcategoryCode}-${nameCode}-${timestamp}`;
  updateField('sku', generatedSKU);
  
  console.log('Generated SKU:', generatedSKU);
};

  // Add pricing option
  const addPricingOption = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, { unit: 'gram', weight: 1, price: 0 }]
    }));
  };

  // Remove pricing option
  const removePricingOption = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

    // Update pricing option
    const updatePricingOption = (index, field, value) => {
    setFormData(prev => ({
        ...prev,
        pricing: prev.pricing.map((option, i) => 
        i === index ? { 
            ...option, 
            [field]: field === 'unit' ? value : (value === '' ? '' : Number(value))
        } : option
        )
    }));
    };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate the entire form
  const errors = validateForm();
  setValidationErrors(errors);
  
  if (Object.keys(errors).length > 0) {
    setError('Please fix the validation errors before submitting.');
    setCurrentSection('review'); // Go to review section to show errors
    return;
  }
  
  setLoading(true);
  setError('');

    try {
      // Basic validation
      if (!formData.name || !formData.sku || !formData.category || !formData.compliance.batchNumber) {
        throw new Error('Please fill in all required fields');
      }

      // Create the product
      const productData = {
        ...formData,
        createdBy: user._id
      };

      const result = await productApi.createProduct(productData);
      
      // Success - redirect to product catalog
      navigate('/products', { 
        state: { 
          message: `Product "${formData.name}" created successfully!`,
          type: 'success' 
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Navigation between sections
const nextSection = () => {
  const currentIndex = sections.findIndex(s => s.id === currentSection);
  
  // Validate current section before moving to next
  const sectionErrors = validateSection(currentSection);
  
  if (Object.keys(sectionErrors).length > 0) {
    // Update validation errors to show what needs to be fixed
    setValidationErrors(prev => ({
      ...prev,
      ...sectionErrors
    }));
    
    // Show error message
    setError(`Please complete all required fields in the ${sections[currentIndex].name} section before continuing.`);
    return; // Don't proceed to next section
  }
  
  // Clear any existing errors for this section since it's valid
  setError('');
  const clearedErrors = { ...validationErrors };
  Object.keys(sectionErrors).forEach(key => {
    delete clearedErrors[key];
  });
  setValidationErrors(clearedErrors);
  
  // Move to next section
  if (currentIndex < sections.length - 1) {
    setCurrentSection(sections[currentIndex + 1].id);
  }
};

  const previousSection = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
            <Button
              variant="secondary"
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
          </div>
          <p className="text-gray-600 mt-2">Add a new product to your catalog</p>
        </div>

        {/* Section Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4 overflow-x-auto">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  currentSection === section.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            

            {/* Section Content */}
            {currentSection === 'basic' && (
            <BasicInfoSection 
                formData={formData}
                updateField={updateField}
                categories={categories}
                subcategories={subcategories}
                generateSKU={generateSKU}
                validationErrors={validationErrors}
            />
            )}

            {currentSection === 'cannabinoids' && (
            <CannabinoidsSection 
                formData={formData}
                updateField={updateField}
            />
            )}

            {currentSection === 'pricing' && (
            <PricingSection 
                formData={formData}
                updateField={updateField}
                units={units}
                inventoryUnits={inventoryUnits}
                addPricingOption={addPricingOption}
                removePricingOption={removePricingOption}
                updatePricingOption={updatePricingOption}
            />
            )}

            {currentSection === 'details' && (
            <DetailsSection 
                formData={formData}
                updateField={updateField}
                availableEffects={availableEffects}
                validationErrors={validationErrors}
            />
            )}

            {currentSection === 'compliance' && (
            <ComplianceSection 
                formData={formData}
                updateField={updateField}
                validationErrors={validationErrors}
            />
            )}

            {currentSection === 'review' && (
            <ReviewSection 
                formData={formData}
                validationErrors={validationErrors}
                getFieldDisplayName={getFieldDisplayName}
            />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={previousSection}
              disabled={currentSection === 'basic'}
            >
              Previous
            </Button>
            
            <div className="flex space-x-4">
              {currentSection !== 'review' && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextSection}
                >
                  Next
                </Button>
              )}
              
              {currentSection === 'review' && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="px-8 bg-blue-700 text-white rounded-md"
                >
                  {loading ? 'Creating Product...' : 'Create Product'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUploadField = ({ images, updateField, validationErrors }) => {
  const [previews, setPreviews] = useState(images.map(img => img.url || ''));
  
  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...previews];
      newPreviews[index] = e.target.result;
      setPreviews(newPreviews);

      // Update form data
      const newImages = [...images];
      newImages[index] = {
        url: e.target.result, // Base64 data URL
        alt: `${file.name}`
      };
      updateField('images', newImages);
    };
    reader.readAsDataURL(file);
  };

  const addImageSlot = () => {
    const newImages = [...images, { url: '', alt: '' }];
    const newPreviews = [...previews, ''];
    updateField('images', newImages);
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    updateField('images', newImages);
    setPreviews(newPreviews);
  };

  const updateAltText = (index, alt) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt };
    updateField('images', newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700">Product Images</h3>
        <button
          type="button"
          onClick={addImageSlot}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
        >
          + Add Image
        </button>
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No images added yet</p>
          <button
            type="button"
            onClick={addImageSlot}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add your first image
          </button>
        </div>
      )}

      {images.map((image, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            {/* Image Preview */}
            <div className="flex-shrink-0">
              {previews[index] ? (
                <img
                  src={previews[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, index)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text (for accessibility)
                </label>
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  placeholder="Describe this image..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="flex-shrink-0 text-red-600 hover:text-red-700 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <div className="text-sm text-gray-500">
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Recommended dimensions: 800x800px or larger</p>
      </div>
    </div>
  );
};

// Section Components (to be defined below)
const BasicInfoSection = ({ formData, updateField, categories, subcategories, generateSKU, validationErrors }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <InputField
          label="Product Name *"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g., Purple Kush"
          required
          className={validationErrors?.name ? 'border-red-500 focus:border-red-500' : ''}
        />
        {validationErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>
      
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <InputField
              label="SKU *"
              value={formData.sku}
              onChange={(e) => updateField('sku', e.target.value)}
              placeholder="e.g., FL-IN-PUR-123"
              required
              className={validationErrors?.sku ? 'border-red-500 focus:border-red-500' : ''}
            />
            {validationErrors?.sku && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.sku}</p>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={generateSKU}
            className="mt-7"
          >
            Generate
          </Button>
        </div>
      </div>
      
      <div>
        <SelectField
          label="Category *"
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          options={categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))}
          required
          className={validationErrors?.category ? 'border-red-500 focus:border-red-500' : ''}
        />
        {validationErrors?.category && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
        )}
      </div>
      
      <div>
        <SelectField
          label="Subcategory *"
          value={formData.subcategory}
          onChange={(e) => updateField('subcategory', e.target.value)}
          options={subcategories.map(sub => ({ value: sub, label: sub.charAt(0).toUpperCase() + sub.slice(1) }))}
          className={validationErrors?.subcategory ? 'border-red-500 focus:border-red-500' : ''}
        />
        {validationErrors?.subcategory && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.subcategory}</p>
        )}
      </div>
    </div>
    
    <TextareaField
      label="Description"
      value={formData.description}
      onChange={(e) => updateField('description', e.target.value)}
      placeholder="Describe the product..."
      rows={4}
      maxLength={1000}
    />
  </div>
);

const CannabinoidsSection = ({ formData, updateField }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Cannabinoid Profile</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Percentages (for flower/concentrates)</h3>
        <div className="space-y-4">
            <InputField
                label="THC Percentage"
                type="number"
                value={formData.cannabinoids.thcPercentage}
                onChange={(e) => updateField('cannabinoids.thcPercentage', e.target.value)}
                placeholder="Enter THC %"
                min={0}
                max={100}
                step="0.1"
            />
            <InputField
                label="CBD Percentage"
                type="number"
                value={formData.cannabinoids.cbdPercentage}
                onChange={(e) => updateField('cannabinoids.cbdPercentage', e.target.value)}
                placeholder="Enter CBD %"
                min={0}
                max={100}
                step="0.1"
            />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Milligrams (for edibles)</h3>
        <div className="space-y-4">
            <InputField
                label="THC mg"
                type="number"
                value={formData.cannabinoids.thcMg}
                onChange={(e) => updateField('cannabinoids.thcMg', e.target.value)}
                placeholder="Enter THC mg"
                min={0}
            />
            <InputField
                label="CBD mg" 
                type="number"
                value={formData.cannabinoids.cbdMg}
                onChange={(e) => updateField('cannabinoids.cbdMg', e.target.value)}
                placeholder="Enter CBD mg"
                min={0}
            />
        </div>
      </div>
    </div>
  </div>
);

const PricingSection = ({ formData, updateField, units, inventoryUnits, addPricingOption, removePricingOption, updatePricingOption }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Pricing & Inventory</h2>
    
    {/* Pricing Options */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">Pricing Options</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addPricingOption}
        >
          Add Pricing Option
        </Button>
      </div>
      
      <div className="space-y-4">
        {formData.pricing.map((option, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <SelectField
              label="Unit"
              value={option.unit}
              onChange={(e) => updatePricingOption(index, 'unit', e.target.value)}
              options={units.map(unit => ({ value: unit, label: unit.charAt(0).toUpperCase() + unit.slice(1) }))}
            />
            
            <InputField
            label="Weight (grams)"
            type="number"
            value={option.weight}
            onChange={(e) => updatePricingOption(index, 'weight', e.target.value)}
            placeholder="Enter weight"
            min={0}
            step="0.01"
            />
            
            <InputField
            label="Price ($)"
            type="number"
            value={option.price}
            onChange={(e) => updatePricingOption(index, 'price', e.target.value)}
            placeholder="Enter price"
            min={0}
            step="0.01"
            />
            
            {formData.pricing.length > 1 && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removePricingOption(index)}
                className="mt-6"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
    
    {/* Inventory */}
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Inventory</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Current Stock"
          type="number"
          value={formData.inventory.currentStock}
          onChange={(e) => updateField('inventory.currentStock', Number(e.target.value))}
          min={0}
        />
        
        <SelectField
          label="Inventory Unit"
          value={formData.inventory.unit}
          onChange={(e) => updateField('inventory.unit', e.target.value)}
          options={inventoryUnits.map(unit => ({ value: unit, label: unit.charAt(0).toUpperCase() + unit.slice(1) }))}
        />
        
        <InputField
          label="Low Stock Alert"
          type="number"
          value={formData.inventory.lowStockAlert}
          onChange={(e) => updateField('inventory.lowStockAlert', Number(e.target.value))}
          min={0}
        />
      </div>
    </div>
  </div>
);

const DetailsSection = ({ formData, updateField, availableEffects, validationErrors }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Product Details</h2>
    
    {/* Images Section */}
    <ImageUploadField
      images={formData.images}
      updateField={updateField}
      validationErrors={validationErrors}
    />
    
    {/* Effects Section */}
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Effects</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {availableEffects.map(effect => (
          <label key={effect} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.effects.includes(effect)}
              onChange={(e) => {
                if (e.target.checked) {
                  updateField('effects', [...formData.effects, effect]);
                } else {
                  updateField('effects', formData.effects.filter(eff => eff !== effect));
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 capitalize">{effect}</span>
          </label>
        ))}
      </div>
    </div>
    
    {/* Flavors Section */}
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Flavors</h3>
      <p className="text-sm text-gray-600 mb-2">Enter flavors separated by commas</p>
      <InputField
        value={formData.flavors.join(', ')}
        onChange={(e) => updateField('flavors', e.target.value.split(',').map(f => f.trim()).filter(f => f))}
        placeholder="e.g., Sweet, Earthy, Citrus"
      />
    </div>
  </div>
);

const ComplianceSection = ({ formData, updateField, validationErrors }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Compliance Information</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <InputField
          label="Batch Number *"
          value={formData.compliance.batchNumber}
          onChange={(e) => updateField('compliance.batchNumber', e.target.value)}
          placeholder="e.g., PK-2024-004"
          required
          className={validationErrors['compliance.batchNumber'] ? 'border-red-500 focus:border-red-500' : ''}
        />
        {validationErrors['compliance.batchNumber'] && (
          <p className="mt-1 text-sm text-red-600">{validationErrors['compliance.batchNumber']}</p>
        )}
      </div>
      
      <InputField
        label="Licensed Producer"
        value={formData.compliance.licensedProducer}
        onChange={(e) => updateField('compliance.licensedProducer', e.target.value)}
        placeholder="Producer name"
      />
      
      <InputField
        label="Harvest Date"
        type="date"
        value={formData.compliance.harvestDate}
        onChange={(e) => updateField('compliance.harvestDate', e.target.value)}
      />
      
      <InputField
        label="Packaged Date"
        type="date"
        value={formData.compliance.packagedDate}
        onChange={(e) => updateField('compliance.packagedDate', e.target.value)}
      />
      
      <InputField
        label="Expiration Date"
        type="date"
        value={formData.compliance.expirationDate}
        onChange={(e) => updateField('compliance.expirationDate', e.target.value)}
      />
      
      <InputField
        label="State Tracking ID"
        value={formData.compliance.stateTrackingId}
        onChange={(e) => updateField('compliance.stateTrackingId', e.target.value)}
        placeholder="State tracking number"
      />
    </div>
    
    <div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.compliance.labTested}
          onChange={(e) => updateField('compliance.labTested', e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">Lab Tested</span>
      </label>
    </div>
  </div>
);

const ReviewSection = ({ formData, validationErrors, getFieldDisplayName }) => {
  // Safely calculate validation without calling validateSection during render
  const checkBasicSection = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Product name is required';
    if (!formData.sku?.trim()) errors.sku = 'SKU is required';
    if (!formData.category) errors.category = 'Category is required';
    
    const categoriesRequiringSubcategory = ['flower', 'edible', 'concentrate', 'pre-roll'];
    if (categoriesRequiringSubcategory.includes(formData.category) && !formData.subcategory) {
      errors.subcategory = 'Subcategory is required for this product type';
    }
    return errors;
  };

  const checkPricingSection = () => {
    const errors = {};
    
    // Fixed validation logic - convert to numbers and check for valid values
    const validPricingOptions = formData.pricing.filter(p => {
      const weight = Number(p.weight);
      const price = Number(p.price);
      
      // Check that both weight and price exist, are numbers, and are greater than 0
      return !isNaN(weight) && weight > 0 && !isNaN(price) && price > 0;
    });
    
    if (validPricingOptions.length === 0) {
      errors.pricing = 'At least one pricing option with weight and price is required';
    }
    
    // Fix inventory validation too
    const currentStock = Number(formData.inventory.currentStock);
    if (isNaN(currentStock) || currentStock < 0) {
      errors['inventory.currentStock'] = 'Current stock must be 0 or greater';
    }
    
    return errors;
  };

  const checkComplianceSection = () => {
    const errors = {};
    if (!formData.compliance.batchNumber?.trim()) {
      errors['compliance.batchNumber'] = 'Batch number is required';
    }
    return errors;
  };

  // Calculate all current section errors
  const allSectionErrors = {
    ...checkBasicSection(),
    ...checkPricingSection(),
    ...checkComplianceSection()
  };
  
  // FIXED: Only show errors that are BOTH in validationErrors AND allSectionErrors
  // This prevents showing stale errors when current validation passes
  const currentErrors = {};
  if (validationErrors) {
    Object.keys(validationErrors).forEach(key => {
      // Only include the error if it ALSO exists in current validation
      if (allSectionErrors[key]) {
        currentErrors[key] = validationErrors[key];
      }
    });
  }
  
  const errors = Object.keys(currentErrors);
  const hasErrors = errors.length > 0;
  const allSectionsValid = Object.keys(allSectionErrors).length === 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Review & Submit</h2>
      
      {/* Validation Errors Summary - Only show current errors */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following issues before creating the product:
              </h3>
            </div>
          </div>
          <div className="mt-2">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map(fieldPath => (
                <li key={fieldPath} className="text-red-600">
                  <span className="font-medium">{getFieldDisplayName ? getFieldDisplayName(fieldPath) : fieldPath}:</span> {currentErrors[fieldPath]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Show errors from other sections that aren't in current validationErrors */}
      {!hasErrors && !allSectionsValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Please complete all required fields in previous sections:
              </h3>
            </div>
          </div>
          <div className="mt-2">
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              {Object.keys(allSectionErrors).map(fieldPath => (
                <li key={fieldPath} className="text-yellow-600">
                  <span className="font-medium">{getFieldDisplayName ? getFieldDisplayName(fieldPath) : fieldPath}:</span> {allSectionErrors[fieldPath]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Product Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className={allSectionErrors?.name ? 'text-red-600' : ''}>
            <strong>Name:</strong> {formData.name || <em className="text-red-500">Required</em>}
          </div>
          <div className={allSectionErrors?.sku ? 'text-red-600' : ''}>
            <strong>SKU:</strong> {formData.sku || <em className="text-red-500">Required</em>}
          </div>
          <div className={allSectionErrors?.category ? 'text-red-600' : ''}>
            <strong>Category:</strong> {formData.category || <em className="text-red-500">Required</em>}
          </div>
          <div className={allSectionErrors?.subcategory ? 'text-red-600' : ''}>
            <strong>Subcategory:</strong> {formData.subcategory || <em className="text-red-500">Required</em>}
          </div>
          <div className={allSectionErrors?.['compliance.batchNumber'] ? 'text-red-600' : ''}>
            <strong>Batch Number:</strong> {formData.compliance.batchNumber || <em className="text-red-500">Required</em>}
          </div>
          <div className={allSectionErrors?.pricing ? 'text-red-600' : ''}>
            <strong>Pricing Options:</strong> {formData.pricing?.filter(p => p.weight && p.price).length || <em className="text-red-500">At least 1 required</em>}
          </div>
        </div>
        
        {/* Images Preview in Review */}
        {formData.images && formData.images.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="mb-2">
              <strong>Images:</strong> {formData.images.filter(img => img.url).length} uploaded
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {formData.images.filter(img => img.url).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt || `Product image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Success Message - Only show when ALL sections are valid */}
      {allSectionsValid && !hasErrors && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            ✅ All required fields are complete. Your product is ready to be created!
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to convert field paths to display names
const getFieldDisplayName = (fieldPath) => {
  const displayNames = {
    'name': 'Product Name',
    'sku': 'SKU',
    'category': 'Category',
    'subcategory': 'Subcategory',
    'compliance.batchNumber': 'Batch Number',
    'pricing': 'Pricing Options',
    'inventory.currentStock': 'Current Stock'
  };
  return displayNames[fieldPath] || fieldPath;
};

export default CreateProduct;