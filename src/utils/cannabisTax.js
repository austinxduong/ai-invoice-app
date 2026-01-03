// Cannabis Tax Configuration
let taxConfig = {
  exciseTax: {
    enabled: true,
    rate: 15, // 15% excise tax on cannabis products
  },
  salesTax: {
    state: { enabled: true, rate: 8.5 },
    county: { enabled: true, rate: 1.5 },
    city: { enabled: true, rate: 0.5 },
  },
  cultivationTax: {
    enabled: true,
    rates: {
      flower: 0.35,      // $10.08/oz = $0.35/gram
      trim: 0.05,        // $1.35/oz = $0.05/gram
      concentrate: 0,    // Tax paid by manufacturer
      edible: 0,         // Tax paid by manufacturer
      preroll: 0.35      // Same as flower
    }
  },
};

// Configure tax rates (for different jurisdictions)
export const setTaxConfig = (newConfig) => {
  taxConfig = { ...taxConfig, ...newConfig };
};

export const getTaxRates = () => ({ ...taxConfig });

// Check if item is subject to cannabis excise tax
const isCannabisTaxable = (item) => {
  // ✅ FIX: Support both singular and plural forms
  const cannabisCategories = [
    'flower', 'flowers',
    'edible', 'edibles',
    'concentrate', 'concentrates',  // ← Added plural!
    'pre-roll', 'pre-rolls', 'preroll', 'prerolls',
    'topical', 'topicals',
    'vape', 'vapes',
    'cart', 'carts', 'cartridge', 'cartridges'
  ];
  return cannabisCategories.includes(item.category?.toLowerCase());
};

// Get cultivation tax rate based on category
const getCultivationRate = (category) => {
  const cat = category?.toLowerCase() || '';
  
  // Flower/Pre-rolls
  if (cat.includes('flower') || cat.includes('pre-roll') || cat.includes('preroll')) {
    return taxConfig.cultivationTax.rates.flower;
  }
  
  // Trim
  if (cat.includes('trim') || cat.includes('shake')) {
    return taxConfig.cultivationTax.rates.trim;
  }
  
  // Concentrates/Edibles/Others - no cultivation tax (paid at source)
  return 0;
};

// Calculate tax for a single item
export const calculateItemTax = (item) => {
  const itemTotal = (item.pricingOption?.price || 0) * item.quantity;
  const weight = item.pricingOption?.weight || 0;
  
  let subtotal = itemTotal;
  let exciseTax = 0;
  let salesTax = 0;
  let cultivationTax = 0;

  // 1. Cultivation Tax (weight-based, varies by category)
  if (taxConfig.cultivationTax.enabled && weight > 0 && isCannabisTaxable(item)) {
    const ratePerGram = getCultivationRate(item.category);
    cultivationTax = weight * ratePerGram * item.quantity;
  }

  // 2. Excise Tax (15% of retail price, all cannabis products)
  if (taxConfig.exciseTax.enabled && isCannabisTaxable(item)) {
    exciseTax = subtotal * (taxConfig.exciseTax.rate / 100);
  }

  // 3. Sales Tax (percentage of subtotal + excise tax)
  const taxableAmount = subtotal + exciseTax;
  const totalSalesTaxRate = 
    (taxConfig.salesTax.state.enabled ? taxConfig.salesTax.state.rate : 0) +
    (taxConfig.salesTax.county.enabled ? taxConfig.salesTax.county.rate : 0) +
    (taxConfig.salesTax.city.enabled ? taxConfig.salesTax.city.rate : 0);

  salesTax = taxableAmount * (totalSalesTaxRate / 100);

  const totalTax = cultivationTax + exciseTax + salesTax;
  const grandTotal = subtotal + totalTax;

  return {
    subtotal,
    taxes: {
      cultivation: cultivationTax,
      excise: exciseTax,
      sales: {
        state: taxConfig.salesTax.state.enabled ? 
          taxableAmount * (taxConfig.salesTax.state.rate / 100) : 0,
        county: taxConfig.salesTax.county.enabled ? 
          taxableAmount * (taxConfig.salesTax.county.rate / 100) : 0,
        city: taxConfig.salesTax.city.enabled ? 
          taxableAmount * (taxConfig.salesTax.city.rate / 100) : 0,
        total: salesTax,
      },
      total: totalTax,
    },
    grandTotal,
    effectiveTaxRate: subtotal > 0 ? (totalTax / subtotal) * 100 : 0,
  };
};

// Calculate tax for entire cart
export const calculateCartTax = (cartItems) => {
  if (!cartItems.length) {
    return {
      subtotal: 0,
      taxes: {
        cultivation: 0,
        excise: 0,
        sales: { state: 0, county: 0, city: 0, total: 0 },
        total: 0,
      },
      grandTotal: 0,
    };
  }

  const itemCalculations = cartItems.map(calculateItemTax);
  
  return {
    subtotal: itemCalculations.reduce((sum, calc) => sum + calc.subtotal, 0),
    taxes: {
      cultivation: itemCalculations.reduce((sum, calc) => sum + calc.taxes.cultivation, 0),
      excise: itemCalculations.reduce((sum, calc) => sum + calc.taxes.excise, 0),
      sales: {
        state: itemCalculations.reduce((sum, calc) => sum + calc.taxes.sales.state, 0),
        county: itemCalculations.reduce((sum, calc) => sum + calc.taxes.sales.county, 0),
        city: itemCalculations.reduce((sum, calc) => sum + calc.taxes.sales.city, 0),
        total: itemCalculations.reduce((sum, calc) => sum + calc.taxes.sales.total, 0),
      },
      total: itemCalculations.reduce((sum, calc) => sum + calc.taxes.total, 0),
    },
    grandTotal: itemCalculations.reduce((sum, calc) => sum + calc.grandTotal, 0),
  };
};

// Format currency helper
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};