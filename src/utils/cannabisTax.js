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
    enabled: false,
    ratePerGram: 0.10, // $0.10 per gram
  },
};

// Configure tax rates (for different jurisdictions)
export const setTaxConfig = (newConfig) => {
  taxConfig = { ...taxConfig, ...newConfig };
};

export const getTaxRates = () => ({ ...taxConfig });

// Check if item is subject to cannabis excise tax
const isCannabisTaxable = (item) => {
  const cannabisCategories = ['flower', 'edible', 'concentrate', 'pre-roll', 'topical'];
  return cannabisCategories.includes(item.category?.toLowerCase());
};

// Calculate tax for a single item
export const calculateItemTax = (item) => {
  const itemTotal = (item.pricingOption?.price || 0) * item.quantity;
  const weight = item.pricingOption?.weight || 0;
  
  let subtotal = itemTotal;
  let exciseTax = 0;
  let salesTax = 0;
  let cultivationTax = 0;

  // 1. Cultivation Tax (if enabled, weight-based)
  if (taxConfig.cultivationTax.enabled && weight > 0 && isCannabisTaxable(item)) {
    cultivationTax = weight * taxConfig.cultivationTax.ratePerGram * item.quantity;
  }

  // 2. Excise Tax (percentage of subtotal, cannabis only)
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