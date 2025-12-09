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

        const response = await fetch(`${API_URL}/api/transactions`, {
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

// Fetch transactions with filtering
export const fetchTransactions = async (filters = {}) => {
    try {
        console.log('📊 Fetching transactions with filters:', filters);

        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const response = await fetch(`${API_URL}/api/transactions?${queryParams}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        const result = await response.json();
        console.log('✅ Fetched transactions:', result.transactions?.length || 0, 'transactions');
        return result;

    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        // Return empty result to prevent crashes
        return { transactions: [] };
    }
};

// Fetch daily sales data
export const fetchDailySales = async (date = new Date()) => {
    try {
        const dateString = date.toISOString().split('T')[0];
        console.log('📊 Fetching daily sales for:', dateString);

        const response = await fetch(`${API_URL}/api/transactions/reports/daily?date=${dateString}`, {
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
            `${API_URL}/api/transactions/reports/summary?startDate=${startDate}&endDate=${endDate}`,
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

        const response = await fetch(`${API_URL}/api/transactions/${id}`, {
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