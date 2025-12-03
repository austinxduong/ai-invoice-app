import axiosInstance from "../utils/axiosInstance";

// cannabis product API servie
export const productApi = {
    getProducts:async(filters ={}) => {
        try {
            const params = new URLSearchParams();

            // add filters as query parameters
            if (filters.category) params.append('category', filters.category);
            if (filters.subcategory) params.append('subcategory', filters.subcategory);
            if (filters.search) params.append('search', filters.search);
            if (filters.inStock) params.append('inStock', filters.inStock);
            if (filters.lowStock) params.append('lowStock', filters.lowStock);
            if (filters.page) params.attend('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);

            const queryString = params.toString();
            const url = queryString ? `/products${queryString}` : '/products'

            const response = await axiosInstance.get(url);
            return response.data;  
        } catch (error) {
            console.error('Error fetching products', error);
            throw error;
        }
    },

    // get single product by ID
    getProduct: async (productsId) => {
        try {
            const response = await axiosInstance.get(`/products/${productsId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // create new product
    createProduct: async(productData) => {
        try {
            const response = await axiosInstance.post('/products', productData);
            return response.data
        } catch (error) {
            console.error('Error creating product', error);
            throw error;
        }
    },

    // get category statistics
    getCategoryStats: async () => {
        try {
            const response = await axiosInstance.get('/products/categories/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching category stats:', error);
            throw error;
        }
    }
};

// cannabis-specific helper functions
export const cannabisHelpers = {
    // Format THC/CBD percentages for display
    formatCannabinoids: (cannabinoids) => {
        const { thcPercentage, cbdPercentage, thcMg, cbdMg } = cannabinoids;

        if (thcMg || cbdMg) {
            return {
                thc: thcMg ? `${thcMg}mg THC` : '0mg THC',
                cbd: cbdMg ? `${cbdMg}mg CBD` : '0mg CBD',
                display: `${thcMg || 0}mg THC / ${cbdMg || 0}mg CBD`
            };
        } else {
            return {
                thc: `${thcPercentage || 0}% THC`,
                cbd: `${cbdPercentage || 0}% CBD`,
                display: `${thcPercentage || 0}% THC / ${cbdPercentage || 0}% CBD`
            };
        }
    },

    getCategoryDisplayName:(category) => {
        const categoryNames = {
            flow: 'Flower',
            edible: 'Edibles',
            concentrate: 'Concentrate',
            topic: 'Topicals',
            accessory: 'Accessories',
            'pre-roll': 'Pre-Rolls'
        };
        return categoryNames[category] || category;
    },

    // get strain type color for UI
    getStrainColor:(subcategory) => {
        const colors = {
            indica: 'bg-purple-100 text-purple-900',
            sativa: 'bg-green-100 text-green-800',
            hybrid: 'bg-blue-100 text-blue-800',
            cbd: 'bg-orange-100 text-orange-800',
            'high-cbd': 'bg-orange-100 text-orange-800',
            balanced: 'bg-gray-100 text-gray-800'
        };
        return colors[subcategory] || 'bg-gray-100 text-gray-800';
    },

    // check if product is in stock
    isInStock: (product) => {
        return product.inventory?.currentStock > 0;
    },

    // get inventory status
    getInventoryStatus: (product) => {
        if (!cannabisHelpers.isInStock(product)) {
            return {status: 'out-of-stock', text:'Out of Stock', color: 'text-red-600'};
        } else if (products.inventory?.currentStock <= product.inventory?.lowStockAlert) {
            return {status: 'low-stock', text:'Low Stock', color:'text-orange-600'};
        } else {
            return {status: 'in-stock', text:'In Stock', color:'text-green600'};
        }
    },

    // format pricing for display
    formatPricing:(pricing) => {
        if(!pricing || pricing.length === 0) return 'Price not available';
        const firstPrice = pricing[0];
        return `$${firstPrice.price.toFixed(2)} per ${firstPrice.unit}`;
    }
};

export default productApi