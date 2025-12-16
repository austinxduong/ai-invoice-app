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
      thcPercentage: 0,
      cbdPercentage: 0,
      thcMg: 0,
      cbdMg: 0
    },
    
    // Pricing (array of pricing options)
    pricing: [{ unit: 'gram', weight: 1, price: 0 }],
    
    // Inventory
    inventory: {
      currentStock: 0,
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

  // Handle form field updates
  const updateField = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
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
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
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
              />
            )}

            {currentSection === 'review' && (
              <ReviewSection 
                formData={formData}
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
const BasicInfoSection = ({ formData, updateField, categories, subcategories, generateSKU }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
            label="Product Name *"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., Purple Kush"
            required
        />
      
      <div>
        <div className="flex items-center space-x-2">
        <InputField
            label="SKU *"
            value={formData.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            placeholder="e.g., FL-IN-PUR-123"
            required
        />
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
      
      <SelectField
        label="Category *"
        value={formData.category}
        onChange={(e) => updateField('category', e.target.value)}
        options={categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))}
        required
      />
      
      <SelectField
        label="Subcategory"
        value={formData.subcategory}
        onChange={(e) => updateField('subcategory', e.target.value)}
        options={subcategories.map(sub => ({ value: sub, label: sub.charAt(0).toUpperCase() + sub.slice(1) }))}
      />
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
                onChange={(e) => updateField('cannabinoids.thcPercentage', Number(e.target.value))}
                placeholder="0.0"
                min={0}
                max={100}
                step="0.1"
            />
            <InputField
                label="CBD Percentage"
                type="number"
                value={formData.cannabinoids.cbdPercentage}
                onChange={(e) => updateField('cannabinoids.cbdPercentage', Number(e.target.value))}
                placeholder="0.0"
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
                onChange={(e) => updateField('cannabinoids.thcMg', Number(e.target.value))}
                placeholder="0"
                min={0}
            />
            <InputField
                label="CBD mg"
                type="number"
                value={formData.cannabinoids.cbdMg}
                onChange={(e) => updateField('cannabinoids.cbdMg', Number(e.target.value))}
                placeholder="0"
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
              onChange={(e) => updatePricingOption(index, 'weight', Number(e.target.value))}
              min={0}
              step="0.01"
            />
            
            <InputField
              label="Price ($)"
              type="number"
              value={option.price}
              onChange={(e) => updatePricingOption(index, 'price', Number(e.target.value))}
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

const ComplianceSection = ({ formData, updateField }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Compliance Information</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Batch Number *"
        value={formData.compliance.batchNumber}
        onChange={(e) => updateField('compliance.batchNumber', e.target.value)}
        placeholder="e.g., PK-2024-004"
        required
      />
      
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

const ReviewSection = ({ formData }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Review & Submit</h2>
    
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Name:</strong> {formData.name}
        </div>
        <div>
          <strong>SKU:</strong> {formData.sku}
        </div>
        <div>
          <strong>Category:</strong> {formData.category}
        </div>
        <div>
          <strong>Subcategory:</strong> {formData.subcategory || 'None'}
        </div>
        <div>
          <strong>Batch Number:</strong> {formData.compliance.batchNumber}
        </div>
        <div>
          <strong>Pricing Options:</strong> {formData.pricing.length}
        </div>
      </div>
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-blue-800 text-sm">
        Review all information carefully. Once created, some fields may require administrative approval to modify.
      </p>
    </div>
  </div>
);

export default CreateProduct;