// frontend/src/components/invoice/InvoiceComplianceSection.jsx
// Cannabis compliance data display for invoice detail page

import React from 'react';
import { 
  Shield, 
  Calendar, 
  Package, 
  Leaf, 
  Beaker, 
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const InvoiceComplianceSection = ({ invoice }) => {
  if (!invoice || !invoice.items || invoice.items.length === 0) {
    return null;
  }

  // Calculate totals
  const totalWeight = invoice.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  const totalTHC = invoice.items.reduce((sum, item) => sum + (item.thcMg || 0), 0);
  const totalCBD = invoice.items.reduce((sum, item) => sum + (item.cbdMg || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Cannabis Compliance</h2>
        </div>
        <div className="flex items-center gap-2">
          {invoice.stateReported ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              State Reported
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
              <AlertCircle className="w-4 h-4" />
              Not Reported
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Weight */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Weight</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{totalWeight.toFixed(2)}g</p>
        </div>

        {/* Total THC */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total THC</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{totalTHC.toFixed(2)} mg</p>
        </div>

        {/* Total CBD */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total CBD</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{totalCBD.toFixed(2)} mg</p>
        </div>
      </div>

      {/* Product Compliance Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
        
        {invoice.items.map((item, index) => (
          <div key={item._id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            {/* Product Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {item.category}
              </span>
            </div>

            {/* Compliance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SKU & Batch */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">SKU</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.sku || 'N/A'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">Batch Number</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.batchNumber || 'N/A'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">State Tracking ID</span>
                </div>
                <p className="text-sm font-mono text-gray-900">{item.stateTrackingId || 'N/A'}</p>
              </div>

              {/* THC/CBD Content */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">THC Content</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {item.thcContent ? `${item.thcContent}%` : 'N/A'}
                  {item.thcMg > 0 && <span className="text-gray-600"> ({item.thcMg.toFixed(2)} mg)</span>}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">CBD Content</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {item.cbdContent ? `${item.cbdContent}%` : 'N/A'}
                  {item.cbdMg > 0 && <span className="text-gray-600"> ({item.cbdMg.toFixed(2)} mg)</span>}
                </p>
              </div>

              {/* Weight */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">Weight</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {item.weight ? `${item.weight}g` : 'N/A'}
                </p>
              </div>

              {/* Dates */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">Packaged Date</span>
                </div>
                <p className="text-sm text-gray-900">
                  {item.localPackagedDate || 'N/A'}
                </p>
              </div>

              {item.harvestDate && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 uppercase">Harvest Date</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {item.localHarvestDate || 'N/A'}
                  </p>
                </div>
              )}

              {item.expirationDate && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 uppercase">Expiration Date</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {item.localExpirationDate || 'N/A'}
                  </p>
                </div>
              )}

              {/* Lab Testing */}
              {item.labTested && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Beaker className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 uppercase">Lab Test Result</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    item.labTestResult === 'pass' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.labTestResult?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              )}

              {/* Producer Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">Licensed Producer</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.licensedProducer || 'N/A'}</p>
                {item.producerLicense && (
                  <p className="text-xs text-gray-600 mt-1">License: {item.producerLicense}</p>
                )}
              </div>
            </div>

            {/* Strain Info (if available) */}
            {item.strainName && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Strain:</span> {item.strainName}
                  {item.strainType && <span className="ml-2 text-gray-500">({item.strainType})</span>}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* State Reporting Info */}
      {invoice.stateReportDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">State Reporting Complete</p>
              <p className="text-sm text-green-700 mt-1">
                Reported on: {invoice.localUpdatedAt || new Date(invoice.stateReportDate).toLocaleString()}
              </p>
              {invoice.metrcManifestId && (
                <p className="text-xs text-green-600 mt-1 font-mono">
                  Manifest ID: {invoice.metrcManifestId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceComplianceSection;