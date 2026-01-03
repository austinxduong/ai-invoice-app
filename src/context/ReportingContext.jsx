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
            
            // ✅ FIXED: Include all payment methods by default
            console.log('🔍 Frontend: About to call fetchTransactions with params:', {
                startDate: selectedDateRange.startDate.toISOString(),
                endDate: selectedDateRange.endDate.toISOString(),
                status: 'completed',
                ...filters
            });
            
            const result = await fetchTransactions({
                startDate: selectedDateRange.startDate.toISOString(),
                endDate: selectedDateRange.endDate.toISOString(),
                status: 'completed',
                // ✅ No paymentMethod filter = include all (cash, cash+credit, store_credit, etc)
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
        
        const timeoutId = setTimeout(() => {
            loadTransactions();
        }, 100);
        
        return () => clearTimeout(timeoutId);
    }, [selectedDateRange]);

    // Filter transactions by date range
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

    // ✅ NEW: Get payment breakdown for analysis
    const getPaymentBreakdown = (transactionList) => {
        const breakdown = {
            cashOnly: {
                count: 0,
                total: 0,
                cashReceived: 0
            },
            cashAndCredit: {
                count: 0,
                total: 0,
                cashPortion: 0,
                creditPortion: 0
            },
            creditOnly: {
                count: 0,
                total: 0,
                creditUsed: 0
            }
        };

        transactionList.forEach(transaction => {
            const total = transaction.totals.grandTotal;
            const creditApplied = transaction.totals.creditApplied || 0;
            const cashReceived = transaction.cashReceived || transaction.receiptData?.cashReceived || 0;

            if (transaction.paymentMethod === 'cash') {
                breakdown.cashOnly.count++;
                breakdown.cashOnly.total += total;
                breakdown.cashOnly.cashReceived += cashReceived;
            } else if (transaction.paymentMethod === 'cash+credit') {
                breakdown.cashAndCredit.count++;
                breakdown.cashAndCredit.total += total;
                breakdown.cashAndCredit.cashPortion += cashReceived;
                breakdown.cashAndCredit.creditPortion += creditApplied;
            } else if (transaction.paymentMethod === 'store_credit') {
                breakdown.creditOnly.count++;
                breakdown.creditOnly.total += total;
                breakdown.creditOnly.creditUsed += creditApplied;
            }
        });

        return breakdown;
    };

    // Daily Sales Summary (includes all payment methods)
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
            creditRedeemed: 0,  // ✅ NEW: Track credit usage
            transactions: dayTransactions,
            paymentBreakdown: null  // ✅ NEW: Will be populated below
        };

        dayTransactions.forEach(transaction => {
            summary.grossSales += transaction.totals.grandTotal;
            summary.netSales += transaction.totals.subtotal;
            summary.totalTax += transaction.totals.taxAmount;
            summary.discounts += transaction.totals.discountAmount || 0;
            summary.itemsSold += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
            summary.cashReceived += transaction.cashReceived || transaction.receiptData?.cashReceived || 0;
            summary.creditRedeemed += transaction.totals.creditApplied || 0;  // ✅ NEW

            if (transaction.totals.taxBreakdown) {
                summary.exciseTax += transaction.totals.taxBreakdown.excise || 0;
                summary.salesTax += transaction.totals.taxBreakdown.sales?.total || 0;
                summary.cultivationTax += transaction.totals.taxBreakdown.cultivation || 0;
            }
        });

        // ✅ NEW: Add payment breakdown
        summary.paymentBreakdown = getPaymentBreakdown(dayTransactions);

        return summary;
    };

    // Product Performance Report
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

        Object.values(productStats).forEach(stats => {
            stats.averagePrice = stats.quantitySold > 0 ? stats.netRevenue / stats.quantitySold : 0;
        });

        return Object.values(productStats).sort((a, b) => b.grossRevenue - a.grossRevenue);
    };

    // Cannabis Tax Report
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
                cultivationTaxCollected: 0,
                creditRedeemed: 0  // ✅ NEW
            },
            dailyBreakdown: [],
            byCategory: {},
            paymentBreakdown: null  // ✅ NEW
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
                    cultivationTax: 0,
                    creditRedeemed: 0  // ✅ NEW
                };
            }

            const daily = dailyTotals[date];
            daily.transactions += 1;
            daily.grossSales += transaction.totals.grandTotal;
            daily.netSales += transaction.totals.subtotal;
            daily.totalTax += transaction.totals.taxAmount;
            daily.creditRedeemed += transaction.totals.creditApplied || 0;  // ✅ NEW

            if (transaction.totals.taxBreakdown) {
                daily.exciseTax += transaction.totals.taxBreakdown.excise || 0;
                daily.salesTax += transaction.totals.taxBreakdown.sales?.total || 0;
                daily.cultivationTax += transaction.totals.taxBreakdown.cultivation || 0;
            }

            report.summary.grossSales += transaction.totals.grandTotal;
            report.summary.netSales += transaction.totals.subtotal;
            report.summary.totalTaxCollected += transaction.totals.taxAmount;
            report.summary.creditRedeemed += transaction.totals.creditApplied || 0;  // ✅ NEW

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
        report.paymentBreakdown = getPaymentBreakdown(transactionList);  // ✅ NEW

        return report;
    };

    // ✅ UPDATED: Cash Report now includes mixed payments
    const generateCashReport = (startDate, endDate) => {
        const transactionList = getTransactionsInRange(startDate, endDate);
        
        // Include both 'cash' and 'cash+credit' transactions
        const cashTransactions = transactionList.filter(t => 
            t.paymentMethod === 'cash' || t.paymentMethod === 'cash+credit'
        );

        return {
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            summary: {
                totalCashTransactions: cashTransactions.length,
                totalCashReceived: cashTransactions.reduce((sum, t) => 
                    sum + (t.cashReceived || t.receiptData?.cashReceived || 0), 0),
                totalChangeGiven: cashTransactions.reduce((sum, t) => 
                    sum + (t.totals.changeAmount || 0), 0),
                totalRevenue: cashTransactions.reduce((sum, t) => 
                    sum + t.totals.grandTotal, 0),
                creditAppliedInMixed: cashTransactions.reduce((sum, t) => 
                    sum + (t.totals.creditApplied || 0), 0),  // ✅ NEW
                averageTransactionValue: cashTransactions.length > 0 
                    ? cashTransactions.reduce((sum, t) => sum + t.totals.grandTotal, 0) / cashTransactions.length 
                    : 0,
                largestTransaction: Math.max(...cashTransactions.map(t => t.totals.grandTotal), 0),
                paymentBreakdown: getPaymentBreakdown(cashTransactions)  // ✅ NEW
            },
            transactions: cashTransactions.map(transaction => ({
                id: transaction._id || transaction.id,
                localDate: transaction.receiptData?.localDateString || '',
                localTime: transaction.receiptData?.localTimeString || '',
                paymentMethod: transaction.paymentMethod,  // ✅ NEW: Show payment type
                total: transaction.totals.grandTotal,
                cashReceived: transaction.cashReceived || transaction.receiptData?.cashReceived || 0,
                creditApplied: transaction.totals.creditApplied || 0,  // ✅ NEW
                change: transaction.totals.changeAmount || 0,
                items: transaction.items.length,
                customer: transaction.customerInfo?.name || 'Walk-in'
            }))
        };
    };

    // ✅ NEW: Store Credit Report
    const generateCreditReport = (startDate, endDate) => {
        const transactionList = getTransactionsInRange(startDate, endDate);
        
        // Transactions that used credit (partial or full)
        const creditTransactions = transactionList.filter(t => 
            (t.totals.creditApplied || 0) > 0
        );

        return {
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            summary: {
                totalCreditRedeemed: creditTransactions.reduce((sum, t) => 
                    sum + (t.totals.creditApplied || 0), 0),
                transactionsUsingCredit: creditTransactions.length,
                averageCreditPerTransaction: creditTransactions.length > 0
                    ? creditTransactions.reduce((sum, t) => sum + (t.totals.creditApplied || 0), 0) / creditTransactions.length
                    : 0,
                paymentMethodBreakdown: {
                    cashAndCredit: creditTransactions.filter(t => t.paymentMethod === 'cash+credit').length,
                    creditOnly: creditTransactions.filter(t => t.paymentMethod === 'store_credit').length
                }
            },
            transactions: creditTransactions.map(transaction => ({
                id: transaction._id || transaction.id,
                localDate: transaction.receiptData?.localDateString || '',
                localTime: transaction.receiptData?.localTimeString || '',
                paymentMethod: transaction.paymentMethod,
                creditApplied: transaction.totals.creditApplied || 0,
                total: transaction.totals.grandTotal,
                cashPortion: transaction.paymentMethod === 'cash+credit' 
                    ? (transaction.cashReceived || transaction.receiptData?.cashReceived || 0)
                    : 0,
                customer: transaction.customerInfo?.name || 'Walk-in'
            }))
        };
    };

    // Export functions
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
        // State
        transactions,
        loading,
        selectedDateRange,
        setSelectedDateRange,
        
        // Database functions
        loadTransactions,
        
        // Report generators
        generateDailySalesSummary,
        generateProductPerformance,
        generateTaxReport,
        generateCashReport,
        generateCreditReport,  // ✅ NEW
        
        // Utility functions
        getTransactionsInRange,
        getPaymentBreakdown,  // ✅ NEW
        exportToCSV,
        
        // Quick access to common reports
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