import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileBarChart, 
  Calendar,
  Download,
  Receipt,
  PieChart,
  Target
} from 'lucide-react';
import { useReporting } from '../../context/ReportingContext';

const ReportsDashboard = () => {
  const { 
    selectedDateRange, 
    setSelectedDateRange,
    getTodaysSales,
    getThisMonthTax,
    generateProductPerformance,
    generateCashReport,
    exportToCSV,
    transactions // ✅ ADD THIS - import transactions from context
  } = useReporting();

  const [activeReport, setActiveReport] = useState('overview');

  // ✅ FIXED: Initialize with default structure to prevent undefined errors
  const [todaysSales, setTodaysSales] = useState({
    grossSales: 0,
    netSales: 0,
    totalTax: 0,
    transactionCount: 0,
    itemsSold: 0,
    transactions: []
  });

  const [monthlyTax, setMonthlyTax] = useState({
    summary: {
      totalTaxCollected: 0,
      exciseTaxCollected: 0,
      salesTaxCollected: 0,
      totalTransactions: 0
    },
    dailyBreakdown: []
  });

  // ✅ FIXED: Use transactions from context and add error handling
  useEffect(() => {
    try {
      const salesData = getTodaysSales();
      setTodaysSales(salesData);
    } catch (error) {
      console.error('Error getting today\'s sales:', error);
    }
  }, [transactions, getTodaysSales]); // ✅ Add getTodaysSales to dependencies

  useEffect(() => {
    try {
      const taxData = getThisMonthTax();
      setMonthlyTax(taxData);
    } catch (error) {
      console.error('Error getting monthly tax:', error);
    }
  }, [transactions, getThisMonthTax]); // ✅ Add getThisMonthTax to dependencies

  // Quick stats for dashboard
  const quickStats = [
    {
      title: "Today's Sales",
      value: `$${todaysSales.grossSales.toFixed(2)}`,
      change: `${todaysSales.transactionCount} transactions`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: "Tax Collected Today",
      value: `$${todaysSales.totalTax.toFixed(2)}`,
      change: `${((todaysSales.totalTax / todaysSales.grossSales) * 100 || 0).toFixed(1)}% rate`,
      icon: Receipt,
      color: 'blue'
    },
    {
      title: "Items Sold Today",
      value: todaysSales.itemsSold,
      change: `${(todaysSales.itemsSold / todaysSales.transactionCount || 0).toFixed(1)} avg/transaction`,
      icon: Target,
      color: 'purple'
    },
    {
      title: "Monthly Tax Total",
      value: `$${monthlyTax.summary.totalTaxCollected.toFixed(2)}`,
      change: `${monthlyTax.summary.totalTransactions} transactions`,
      icon: BarChart3,
      color: 'orange'
    }
  ];

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'daily-sales', name: 'Daily Sales', icon: DollarSign },
    { id: 'tax-report', name: 'Tax Report', icon: Receipt },
    { id: 'product-performance', name: 'Product Performance', icon: TrendingUp },
    { id: 'cash-report', name: 'Cash Transactions', icon: FileBarChart },
  ];

const handleDateRangeChange = (field, value) => {
  console.log('📅 Date picker input received:', { field, value });
  
  // Create date without timezone conversion issues
  const [year, month, day] = value.split('-');
  const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  console.log('📅 Date picker - field:', field);
  console.log('📅 Date picker - value:', value);
  console.log('📅 Date picker - newDate:', newDate);
  
  setSelectedDateRange(prev => {
    const updated = {
      ...prev,
      [field]: newDate
    };
    
    console.log('📅 Date picker - updated selectedDateRange:', updated);
    
    return updated;
  });
};

  const exportReport = (reportType) => {
    let data = [];
    let filename = '';

    switch (reportType) {
      case 'daily-sales':
        data = [todaysSales];
        filename = 'daily_sales_summary';
        break;
      case 'tax-report':
        data = monthlyTax.dailyBreakdown;
        filename = 'monthly_tax_report';
        break;
      case 'product-performance':
        const productData = generateProductPerformance(selectedDateRange.startDate, selectedDateRange.endDate)
        data = productData;
        filename = 'product_performance';
        break;
      case 'cash-report':
        const cashReport = generateCashReport(selectedDateRange.startDate, selectedDateRange.endDate);
        data = cashReport.transactions;
        filename = 'cash_transactions';
        break;
      default:
        data = [todaysSales];
        filename = 'sales_overview';
    }

    exportToCSV(data, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={selectedDateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={selectedDateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeReport === report.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <report.icon className="h-4 w-4" />
                <span>{report.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {/* Export Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => exportReport(activeReport)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export to CSV</span>
            </button>
          </div>

          {/* Report Sections */}
          {activeReport === 'overview' && (
            <DashboardOverview 
              todaysSales={todaysSales}
              monthlyTax={monthlyTax}
            />
          )}

          {activeReport === 'daily-sales' && (
            <DailySalesReport todaysSales={todaysSales} />
          )}

          {activeReport === 'tax-report' && (
            <TaxReport monthlyTax={monthlyTax} />
          )}

          {activeReport === 'product-performance' && (
            <ProductPerformanceReport 
              dateRange={selectedDateRange}
              generateProductPerformance={generateProductPerformance}
            />
          )}

          {activeReport === 'cash-report' && (
            <CashReport 
              key={`${selectedDateRange.startDate.toISOString()}-${selectedDateRange.endDate.toISOString()}`}
              dateRange={selectedDateRange}
              generateCashReport={generateCashReport}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Report Components
const DashboardOverview = ({ todaysSales, monthlyTax }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Today's Performance</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Gross Sales:</span>
          <span className="font-medium">${todaysSales.grossSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Net Sales:</span>
          <span className="font-medium">${todaysSales.netSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax Collected:</span>
          <span className="font-medium">${todaysSales.totalTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Transactions:</span>
          <span className="font-medium">{todaysSales.transactionCount}</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Monthly Tax Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Excise Tax:</span>
          <span className="font-medium">${monthlyTax.summary.exciseTaxCollected.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Sales Tax:</span>
          <span className="font-medium">${monthlyTax.summary.salesTaxCollected.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Tax:</span>
          <span className="font-medium">${monthlyTax.summary.totalTaxCollected.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Transactions:</span>
          <span className="font-medium">{monthlyTax.summary.totalTransactions}</span>
        </div>
      </div>
    </div>
  </div>
);

const DailySalesReport = ({ todaysSales }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Today's Sales Summary</h3>
    
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">${todaysSales.grossSales.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Gross Sales</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{todaysSales.transactionCount}</p>
          <p className="text-sm text-gray-600">Transactions</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600">{todaysSales.itemsSold}</p>
          <p className="text-sm text-gray-600">Items Sold</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">${todaysSales.totalTax.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Tax Collected</p>
        </div>
      </div>
    </div>

    {/* Transaction List */}
    {todaysSales.transactions.length > 0 && (
      <div>
        <h4 className="font-medium mb-3">Recent Transactions</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todaysSales.transactions.slice(0, 10).map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {transaction.receiptData?.localTimeString || ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{transaction.transactionId}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{transaction.items.length}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">${transaction.totals.grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">${transaction.totals.taxAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const TaxReport = ({ monthlyTax }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Cannabis Tax Report</h3>
    
    {/* Tax Summary */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="font-medium mb-3">Tax Collection Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-lg font-bold text-yellow-600">${monthlyTax.summary.exciseTaxCollected.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Excise Tax (15%)</p>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-600">${monthlyTax.summary.salesTaxCollected.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Sales Tax</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">${monthlyTax.summary.totalTaxCollected.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Tax</p>
        </div>
      </div>
    </div>

    {/* Daily Breakdown */}
    <div>
      <h4 className="font-medium mb-3">Daily Tax Breakdown</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gross Sales</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Excise Tax</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales Tax</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Tax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {monthlyTax.dailyBreakdown.map(day => (
              <tr key={day.date}>
                <td className="px-4 py-2 text-sm text-gray-900">{day.date}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{day.transactions}</td>
                <td className="px-4 py-2 text-sm text-gray-900">${day.grossSales.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">${day.exciseTax.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">${day.salesTax.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">${day.totalTax.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);


const ProductPerformanceReport = ({ dateRange, generateProductPerformance }) => {
  const productData = generateProductPerformance(dateRange.startDate, dateRange.endDate);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Product Performance</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">THC%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productData.slice(0, 20).map(product => (
              <tr key={product.sku}>
                <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{product.sku}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  <span className="capitalize">{product.category}</span>
                  {product.subcategory && (
                    <span className="text-gray-500"> • {product.subcategory}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{product.quantitySold}</td>
                <td className="px-4 py-2 text-sm text-gray-900">${product.grossRevenue.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">${product.averagePrice.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {product.cannabis?.thc ? `${product.cannabis.thc}%` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CashReport = ({ dateRange, generateCashReport }) => {
  const cashData = generateCashReport(dateRange.startDate, dateRange.endDate);
  

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Cash Transaction Report</h3>
      
      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium mb-3">Cash Transaction Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-lg font-bold text-green-600">{cashData.summary.totalCashTransactions}</p>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">${cashData.summary.totalCashReceived.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Cash Received</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">${cashData.summary.totalChangeGiven.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Change Given</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">${cashData.summary.averageTransactionValue.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Avg Transaction</p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div>
        <h4 className="font-medium mb-3">Cash Transactions</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cash Received</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cashData.transactions.slice(0, 50).map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {transaction.localDate} {transaction.localTime}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{transaction.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">${transaction.total.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">${transaction.cashReceived.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">${transaction.change.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{transaction.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;