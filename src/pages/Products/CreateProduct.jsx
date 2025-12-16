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

const DetailsSection = ({ formData, updateField, availableEffects }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Product Details</h2>
    
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
  const errors = validationErrors ? Object.keys(validationErrors) : [];
  const hasErrors = errors.length > 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Review & Submit</h2>
      
      {/* Validation Errors Summary */}
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
                  <span className="font-medium">{getFieldDisplayName ? getFieldDisplayName(fieldPath) : fieldPath}:</span> {validationErrors[fieldPath]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Product Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className={validationErrors?.name ? 'text-red-600' : ''}>
            <strong>Name:</strong> {formData.name || <em className="text-red-500">Required</em>}
          </div>
          <div className={validationErrors?.sku ? 'text-red-600' : ''}>
            <strong>SKU:</strong> {formData.sku || <em className="text-red-500">Required</em>}
          </div>
          <div className={validationErrors?.category ? 'text-red-600' : ''}>
            <strong>Category:</strong> {formData.category || <em className="text-red-500">Required</em>}
          </div>
          <div className={validationErrors?.subcategory ? 'text-red-600' : ''}>
            <strong>Subcategory:</strong> {formData.subcategory || <em className="text-red-500">Required</em>}
          </div>
          <div className={validationErrors?.['compliance.batchNumber'] ? 'text-red-600' : ''}>
            <strong>Batch Number:</strong> {formData.compliance.batchNumber || <em className="text-red-500">Required</em>}
          </div>
          <div className={validationErrors?.pricing ? 'text-red-600' : ''}>
            <strong>Pricing Options:</strong> {formData.pricing?.filter(p => p.weight && p.price).length || <em className="text-red-500">At least 1 required</em>}
          </div>
        </div>
      </div>
      
      {!hasErrors && (
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