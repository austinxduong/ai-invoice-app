import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTransactions } from '../utils/transactionApi';

const ReportingContext = createContext();

export const ReportingProvider = ({ children }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: firstDayOfMonth,
    endDate: today
});


    // Load transactions from database
    const loadTransactions = async (filters = {}) => {
        console.log('🔍 Frontend: loadTransactions called with:', {
            startDate: selectedDateRange.startDate.toISOString(),
            endDate: selectedDateRange.endDate.toISOString()
        });
        
        setLoading(true);
        setError(null);

        try {
            console.log('📊 Loading transactions from database...');
            
        console.log('🔍 Frontend: About to call fetchTransactions with params:', {
                startDate: selectedDateRange.startDate.toISOString(),
                endDate: selectedDateRange.endDate.toISOString(),
                paymentMethod: 'cash',
                status: 'completed',
                ...filters
            });
            
            const result = await fetchTransactions({
                startDate: selectedDateRange.startDate.toISOString(),
                endDate: selectedDateRange.endDate.toISOString(),
                paymentMethod: 'cash',
                status: 'completed',
                ...filters
            });
            
            console.log('🔍 Frontend: fetchTransactions completed successfully, result:', {
                transactionsCount: result.transactions?.length || 0,
                total: result.total || 0
            });
            
            setTransactions(result.transactions || []);
            setTotalTransactions(result.total || 0);
            console.log('📊 Loaded transactions from DB:', result.transactions?.length || 0);
            
        } catch (error) {
            console.error('❌ Error loading transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // Load transactions when date range changes
    useEffect(() => {
        console.log('🔍 Frontend: useEffect triggered, selectedDateRange:', selectedDateRange);
        
        // Debounce API calls to prevent race conditions
        const timeoutId = setTimeout(() => {
            loadTransactions();
        }, 100); // 100ms delay to batch rapid state changes
        
        return () => clearTimeout(timeoutId);
    }, [selectedDateRange]);


    // Filter transactions by date range (now uses database transactions)
const getTransactionsInRange = (startDate, endDate, transactionList = transactions) => {
    const datesInRange = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        datesInRange.push(
            current.toLocaleDateString('en-US')
        );
        current.setDate(current.getDate() + 1);
    }

    return transactionList.filter(transaction =>
        datesInRange.includes(transaction.receiptData?.localDateString)
    );
};

    // Daily Sales Summary (updated to use database data)
    const generateDailySalesSummary = (date = new Date()) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const dayTransactions = getTransactionsInRange(startOfDay, endOfDay);

        const summary = {
            date: date.toISOString().split('T')[0],
            transactionCount: dayTransactions.length,
            grossSales: 0,
            netSales: 0,
            totalTax: 0,
            exciseTax: 0,
            salesTax: 0,
            cultivationTax: 0,
            discounts: 0,
            itemsSold: 0,
            cashReceived: 0,
            transactions: dayTransactions
        };

        dayTransactions.forEach(transaction => {
            summary.grossSales += transaction.totals.grandTotal;
            summary.netSales += transaction.totals.subtotal;
            summary.totalTax += transaction.totals.taxAmount;
            summary.discounts += transaction.totals.discountAmount || 0;
            summary.itemsSold += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
            summary.cashReceived += transaction.receiptData?.cashReceived || 0;

            // Tax breakdown
            if (transaction.totals.taxBreakdown) {
                summary.exciseTax += transaction.totals.taxBreakdown.excise || 0;
                summary.salesTax += transaction.totals.taxBreakdown.sales?.total || 0;
                summary.cultivationTax += transaction.totals.taxBreakdown.cultivation || 0;
            }
        });

        return summary;
    };

    // Product Performance Report (same logic, database data)
    const generateProductPerformance = (startDate, endDate) => {
        const transactionList = getTransactionsInRange(startDate, endDate);
        const productStats = {};

        transactionList.forEach(transaction => {
            transaction.items.forEach(item => {
                const productKey = `${item.sku}`;
                
                if (!productStats[productKey]) {
                    productStats[productKey] = {
                        sku: item.sku,
                        name: item.name,
                        category: item.category,
                        subcategory: item.subcategory,
                        quantitySold: 0,
                        grossRevenue: 0,
                        netRevenue: 0,
                        taxCollected: 0,
                        transactions: 0,
                        averagePrice: 0,
                        cannabis: item.cannabis
                    };
                }

                const stats = productStats[productKey];
                const itemTotal = (item.pricingOption?.price || 0) * item.quantity;
                
                stats.quantitySold += item.quantity;
                stats.grossRevenue += itemTotal;
                stats.netRevenue += itemTotal;
                stats.transactions += 1;
            });
        });

        // Calculate averages
        Object.values(productStats).forEach(stats => {
            stats.averagePrice = stats.quantitySold > 0 ? stats.netRevenue / stats.quantitySold : 0;
        });

        return Object.values(productStats).sort((a, b) => b.grossRevenue - a.grossRevenue);
    };

    // Cannabis Tax Report (updated to use createdAt field)
    const generateTaxReport = (startDate, endDate) => {
        const transactionList = getTransactionsInRange(startDate, endDate);
        
        const report = {
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            summary: {
                totalTransactions: transactionList.length,
                grossSales: 0,
                netSales: 0,
                totalTaxCollected: 0,
                exciseTaxCollected: 0,
                salesTaxCollected: 0,
                cultivationTaxCollected: 0
            },
            dailyBreakdown: [],
            byCategory: {}
        };

        const dailyTotals = {};
        const categoryTotals = {};

        transactionList.forEach(transaction => {
            const date = new Date(transaction.createdAt || transaction.timestamp).toISOString().split('T')[0];
            
            if (!dailyTotals[date]) {
                dailyTotals[date] = {
                    date,
                    transactions: 0,
                    grossSales: 0,
                    netSales: 0,
                    totalTax: 0,
                    exciseTax: 0,
                    salesTax: 0,
                    cultivationTax: 0
                };
            }

            const daily = dailyTotals[date];
            daily.transactions += 1;
            daily.grossSales += transaction.totals.grandTotal;
            daily.netSales += transaction.totals.subtotal;
            daily.totalTax += transaction.totals.taxAmount;

            if (transaction.totals.taxBreakdown) {
                daily.exciseTax += transaction.totals.taxBreakdown.excise || 0;
                daily.salesTax += transaction.totals.taxBreakdown.sales?.total || 0;
                daily.cultivationTax += transaction.totals.taxBreakdown.cultivation || 0;
            }

            report.summary.grossSales += transaction.totals.grandTotal;
            report.summary.netSales += transaction.totals.subtotal;
            report.summary.totalTaxCollected += transaction.totals.taxAmount;
            if (transaction.totals.taxBreakdown) {
                report.summary.exciseTaxCollected += transaction.totals.taxBreakdown.excise || 0;
                report.summary.salesTaxCollected += transaction.totals.taxBreakdown.sales?.total || 0;
                report.summary.cultivationTaxCollected += transaction.totals.taxBreakdown.cultivation || 0;
            }

            transaction.items.forEach(item => {
                const category = item.category;
                if (!categoryTotals[category]) {
                    categoryTotals[category] = {
                        category,
                        quantity: 0,
                        revenue: 0,
                        taxCollected: 0
                    };
                }
                categoryTotals[category].quantity += item.quantity;
                categoryTotals[category].revenue += (item.pricingOption?.price || 0) * item.quantity;
            });
        });

        report.dailyBreakdown = Object.values(dailyTotals).sort((a, b) => a.date.localeCompare(b.date));
        report.byCategory = categoryTotals;

        return report;
    };

    // Cash Transaction Report (same logic, database data)
    const generateCashReport = (startDate, endDate) => {
        const transactionList = getTransactionsInRange(startDate, endDate);
        const cashTransactions = transactionList.filter(t => t.paymentMethod === 'cash');

        return {
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            summary: {
                totalCashTransactions: cashTransactions.length,
                totalCashReceived: cashTransactions.reduce((sum, t) => sum + (t.cashReceived || t.receiptData?.cashReceived || 0), 0),
                totalChangeGiven: cashTransactions.reduce((sum, t) => sum + (t.totals.changeAmount || 0), 0),
                averageTransactionValue: cashTransactions.length > 0 
                    ? cashTransactions.reduce((sum, t) => sum + t.totals.grandTotal, 0) / cashTransactions.length 
                    : 0,
                largestTransaction: Math.max(...cashTransactions.map(t => t.totals.grandTotal), 0)
            },
            transactions: cashTransactions.map(transaction => ({
                id: transaction._id || transaction.id,
                timestamp: transaction.createdAt || transaction.timestamp,
                total: transaction.totals.grandTotal,
                cashReceived: transaction.cashReceived || transaction.receiptData?.cashReceived || 0,
                change: transaction.totals.changeAmount || 0,
                items: transaction.items.length,
                customer: transaction.customerInfo?.name || 'Walk-in'
            }))
        };
    };

    // Export functions (same as before)
    const exportToCSV = (data, filename) => {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
            Object.values(row).map(value => 
                typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value
            ).join(',')
        );
        
        return [headers, ...rows].join('\n');
    };

    const value = {
        // State (updated to use database transactions)
        transactions, // Now comes from database
        loading, // New loading state
        selectedDateRange,
        setSelectedDateRange,
        
        // New database functions
        loadTransactions,
        
        // Report generators (same interface, database-backed)
        generateDailySalesSummary,
        generateProductPerformance,
        generateTaxReport,
        generateCashReport,
        
        // Utility functions
        getTransactionsInRange,
        exportToCSV,
        
        // Quick access to common reports (updated to use database data)
        getTodaysSales: () => generateDailySalesSummary(new Date()),
        getThisMonthTax: () => {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            return generateTaxReport(firstDay, now);
        }
    };

    return (
        <ReportingContext.Provider value={value}>
            {children}
        </ReportingContext.Provider>
    );
};

export const useReporting = () => {
    const context = useContext(ReportingContext);
    if (!context) {
        throw new Error('useReporting must be used within a ReportingProvider');
    }
    return context;
};