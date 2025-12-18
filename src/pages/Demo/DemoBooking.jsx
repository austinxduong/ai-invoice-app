import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DemoBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    website: '',
    industry: 'dispensary', // dispensary, cultivation, manufacturing, testing
    
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    
    // Business Details
    annualRevenue: '',
    numberOfLocations: '1',
    numberOfEmployees: '',
    currentSoftware: '',
    
    // Cannabis Specific
    licenseTypes: [], // retail, cultivation, manufacturing, testing, distribution
    states: '', // Which states they operate in
    complianceNeeds: [], // seed-to-sale, lab-testing, tax-reporting, inventory
    
    // Discovery Questions
    primaryPainPoints: '',
    timeline: '', // immediate, 1-3months, 3-6months, 6+months
    budget: '', // <5k, 5-15k, 15-50k, 50k+
    decisionMakers: '', // who else is involved in decision
    
    // Demo Preferences
    preferredDemoType: 'live', // live, recorded, self-guided
    timePreference: '', // morning, afternoon, evening
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Marketing
    howDidYouHear: '', // google, referral, linkedin, etc
    marketingConsent: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayField = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit demo request
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requestedAt: new Date().toISOString(),
          status: 'pending'
        })
      });

      if (!response.ok) throw new Error('Failed to submit demo request');

      setSubmitted(true);
      
      // Optional: Send to CRM/Calendar booking system
      // await scheduleDemo(formData);
      
    } catch (error) {
      console.error('Error submitting demo request:', error);
      alert('Error submitting demo request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <DemoBookingSuccess formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See Our Cannabis ERP Platform in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book a personalized demo to see how our platform can streamline your cannabis business operations, 
            ensure compliance, and boost profitability.
          </p>
        </div>

        {/* Demo Request Form */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Request Your Demo</h2>
            <p className="text-gray-600 mt-1">Tell us about your business so we can customize your demo</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
            
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Green Valley Dispensary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://www.yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Business Type *
                  </label>
                  <select
                    required
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="dispensary">Dispensary/Retail</option>
                    <option value="cultivation">Cultivation/Growing</option>
                    <option value="manufacturing">Manufacturing/Processing</option>
                    <option value="testing">Testing Laboratory</option>
                    <option value="distribution">Distribution</option>
                    <option value="integrated">Vertically Integrated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Locations *
                  </label>
                  <select
                    required
                    value={formData.numberOfLocations}
                    onChange={(e) => handleInputChange('numberOfLocations', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="1">1</option>
                    <option value="2-5">2-5</option>
                    <option value="6-10">6-10</option>
                    <option value="11-25">11-25</option>
                    <option value="25+">25+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Cannabis License Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">License & Compliance</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Types (select all that apply) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Retail/Dispensary',
                    'Cultivation',
                    'Manufacturing',
                    'Testing',
                    'Distribution',
                    'Delivery'
                  ].map(license => (
                    <label key={license} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.licenseTypes.includes(license)}
                        onChange={(e) => handleArrayField('licenseTypes', license, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{license}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  States of Operation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.states}
                  onChange={(e) => handleInputChange('states', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="CA, NY, CO"
                />
              </div>
            </div>

            {/* Business Needs Assessment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Needs</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Software Solutions
                </label>
                <input
                  type="text"
                  value={formData.currentSoftware}
                  onChange={(e) => handleInputChange('currentSoftware', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Metrc, BioTrack, Excel, QuickBooks, etc."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Pain Points *
                </label>
                <textarea
                  required
                  value={formData.primaryPainPoints}
                  onChange={(e) => handleInputChange('primaryPainPoints', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="What challenges are you facing with your current operations? (compliance, inventory management, reporting, etc.)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Implementation Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (within 30 days)</option>
                    <option value="1-3months">1-3 months</option>
                    <option value="3-6months">3-6 months</option>
                    <option value="6+months">6+ months</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (Annual)
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="<10k">Under $10,000</option>
                    <option value="10-25k">$10,000 - $25,000</option>
                    <option value="25-50k">$25,000 - $50,000</option>
                    <option value="50-100k">$50,000 - $100,000</option>
                    <option value="100k+">$100,000+</option>
                    <option value="tbd">To be determined</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                  className="mt-1 mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="text-sm">
                  <span className="text-gray-700">
                    I agree to receive marketing communications about cannabis ERP solutions and industry insights. 
                    You can unsubscribe at any time.
                  </span>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  'Request Demo'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Cannabis Businesses Served</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Page Component
const DemoBookingSuccess = ({ formData }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Demo Request Submitted!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your interest in our cannabis ERP platform. 
            Our team will contact you within 24 hours to schedule your personalized demo.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Sales team review (within 4 hours)</li>
              <li>• Demo scheduling call/email</li>
              <li>• Customized demo preparation</li>
              <li>• 45-minute live demonstration</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <a
              href="mailto:sales@yourcompany.com"
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Contact Sales Directly
            </a>
            
            <a
              href="/"
              className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoBooking;