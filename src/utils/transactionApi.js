const API_URL = import.meta.env.VITE_API_URL || 'https://crustless-diastrophic-thi.ngrok-free.dev';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'  // Skip ngrok warning
    };
};

// Create transaction in database
export const createTransaction = async (transactionData) => {
    try {
        console.log('🔄 Creating transaction in database:', transactionData);

        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create transaction');
        }

        const result = await response.json();
        console.log('✅ Transaction created successfully:', result);
        return result;

    } catch (error) {
        console.error('❌ Error creating transaction:', error);
        throw error;
    }
};

// UPDATE the function signature and fetch call:
// Fetch transactions from database
export const fetchTransactions = async (params = {}) => {
    try {
        console.log('🔍 API: fetchTransactions called with params:', params);
        
        const queryParams = new URLSearchParams();
        
        // Build query parameters
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        console.log('🔍 API: Making request to:', `${API_URL}/transactions?${queryParams}`);
        
        const response = await fetch(`${API_URL}/transactions?${queryParams}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('🔍 API: fetchTransactions response:', {
            transactionsCount: result.transactions?.length || 0,
            total: result.pagination?.total || 0
        });
        
        return {
            transactions: result.transactions || [],
            total: result.pagination?.total || 0,
            pagination: result.pagination || {}
        };
        
    } catch (error) {
        console.error('❌ API: Failed to fetch transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
};

// Fetch daily sales data
export const fetchDailySales = async (date = new Date()) => {
    try {
        const dateString = date.toISOString().split('T')[0];
        console.log('📊 Fetching daily sales for:', dateString);

        const response = await fetch(`${API_URL}/transactions/reports/daily?date=${dateString}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch daily sales data');
        }

        const result = await response.json();
        console.log('✅ Daily sales data:', result);
        return result;

    } catch (error) {
        console.error('❌ Error fetching daily sales:', error);
        return {
            data: {
                transactionCount: 0,
                totalSales: 0,
                totalTax: 0,
                totalItems: 0,
                averageTransaction: 0,
                paymentMethodBreakdown: []
            }
        };
    }
};

// Fetch sales summary for date range
export const fetchSalesSummary = async (startDate, endDate) => {
    try {
        console.log('📊 Fetching sales summary from', startDate, 'to', endDate);

        const response = await fetch(
            `${API_URL}/transactions/reports/summary?startDate=${startDate}&endDate=${endDate}`,
            { headers: getAuthHeaders() }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch sales summary');
        }

        const result = await response.json();
        console.log('✅ Sales summary:', result);
        return result;

    } catch (error) {
        console.error('❌ Error fetching sales summary:', error);
        return {
            summary: {
                totalTransactions: 0,
                totalRevenue: 0,
                totalTax: 0,
                totalItems: 0,
                averageTransaction: 0,
                paymentMethods: []
            }
        };
    }
};

// Get transaction by ID
export const fetchTransactionById = async (id) => {
    try {
        console.log('📊 Fetching transaction by ID:', id);

        const response = await fetch(`${API_URL}/transactions/${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transaction');
        }

        const result = await response.json();
        console.log('✅ Transaction fetched:', result);
        return result;

    } catch (error) {
        console.error('❌ Error fetching transaction:', error);
        throw error;
    }
};

export default {
    createTransaction,
    fetchTransactions,
    fetchDailySales,
    fetchSalesSummary,
    fetchTransactionById
};