import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PaymentFromLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Payment form state
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    billingEmail: '',
    billingEmailConfirm: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [paymentErrors, setPaymentErrors] = useState({});
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success'

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 Validating token:', token);
        const response = await axiosInstance.get(`/api/payment/validate/${token}`);
        console.log('✅ Token validated:', response.data);
        setDemoData(response.data);
        // Pre-fill billing email
        setPaymentData(prev => ({
          ...prev,
          billingEmail: response.data.email,
          billingEmailConfirm: response.data.email,
          nameOnCard: `${response.data.firstName} ${response.data.lastName}`
        }));
      } catch (error) {
        console.error('❌ Invalid payment link:', error);
        setTimeout(() => navigate('/demo'), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    validateToken();
  }, [token, navigate]);

  const validatePaymentForm = () => {
    const errors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!paymentData.billingEmail || !emailRegex.test(paymentData.billingEmail)) {
      errors.billingEmail = 'Please enter a valid email address';
    }
    
    if (paymentData.billingEmail !== paymentData.billingEmailConfirm) {
      errors.billingEmailConfirm = 'Email addresses do not match';
    }
    
    // Password validation
    if (!paymentData.password) {
      errors.password = 'Password is required';
    } else if (paymentData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(paymentData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (paymentData.password !== paymentData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }
    
    // Card number validation
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    // Expiry validation
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      errors.expiry = 'Please enter expiry date';
    }
    
    // CVV validation
    if (!paymentData.cvv || paymentData.cvv.length !== 3) {
      errors.cvv = 'Please enter a valid 3-digit CVV';
    }
    
    // Name validation
    if (!paymentData.nameOnCard.trim()) {
      errors.nameOnCard = 'Please enter name on card';
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }
    
    setPaymentLoading(true);
    setPaymentStep('processing');
    
    try {
      console.log('💳 Processing payment for:', demoData);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate test card numbers
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      
      // Stripe test card numbers
      const validTestCards = [
        '4242424242424242', // Visa success
        '5555555555554444', // Mastercard success
        '4000056655665556'  // Visa debit success
      ];
      
      const declinedTestCards = [
        '4000000000000002', // Generic decline
        '4000000000009995'  // Insufficient funds
      ];
      
      if (declinedTestCards.includes(cardNumber)) {
        throw new Error('Your card was declined. Please try a different payment method.');
      }
      
      if (!validTestCards.includes(cardNumber)) {
        throw new Error('Please use a valid test card number: 4242 4242 4242 4242');
      }
      
      // Call account creation endpoint with user's custom password and email
      const response = await axiosInstance.post('/api/payment/create-account', {
        email: paymentData.billingEmail,
        firstName: demoData.firstName,
        lastName: demoData.lastName,
        company: demoData.companyName,
        password: paymentData.password,
        paymentLinkId: demoData.demoId,
        paymentData: {
          cardNumber: cardNumber.slice(-4),
          paymentAmount: 299,
          currency: 'USD',
          paymentMethod: 'card'
        }
      });
      
      if (response.data.success) {
        setPaymentStep('success');
        
        // Show success message
        setTimeout(() => {
          alert(`🎉 Payment Successful & Account Created!\n\nYour login credentials:\nEmail: ${paymentData.billingEmail}\nPassword: [The password you created]\n\nYou can now login to access your cannabis ERP platform!`);
          navigate('/login?account=created');
        }, 1500);
      } else {
        throw new Error(response.data.error || 'Account creation failed');
      }
      
    } catch (error) {
      console.error('❌ Payment failed:', error);
      setPaymentStep('form');
      setPaymentErrors({ 
        general: error.response?.data?.error || error.message || 'Payment failed. Please try again.' 
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Validating payment link...</p>
        </div>
      </div>
    );
  }

  if (!demoData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-6">This payment link is no longer valid or has expired.</p>
          <button 
            onClick={() => navigate('/demo')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Book New Demo
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">Payment Successful!</h2>
          <p className="text-green-700 mb-2">Your account has been created successfully!</p>
          <p className="text-sm text-green-600 mb-4">You can now login with the credentials you created</p>
          <div className="animate-pulse text-sm text-green-600">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto">
        {/* Welcome Back Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              👋 Welcome back, {demoData.firstName}!
            </h2>
            <p className="text-green-700">
              Ready to get <strong>{demoData.companyName}</strong> started?
            </p>
            <p className="text-sm text-green-600 mt-2">
              Demo requested: {new Date(demoData.demoDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Complete Payment & Create Account
          </h1>

          {/* Subscription Details */}
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-green-600">$299</div>
            <div className="text-gray-600">per month</div>
            <div className="text-sm text-gray-500 mt-1">Cancel anytime • 30-day money-back guarantee</div>
          </div>

          {/* Test Mode Warning */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">🧪 TEST MODE</h4>
            <p className="text-sm text-yellow-700 mb-2">
              Use these test card numbers (no real money will be charged):
            </p>
            <div className="text-sm text-yellow-800 font-mono">
              • 4242 4242 4242 4242 (Success)<br/>
              • 4000 0000 0000 0002 (Declined)<br/>
              • Any future expiry date, any 3-digit CVV
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* Account Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              
              {/* Billing Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Email *
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@company.com"
                    value={paymentData.billingEmail}
                    onChange={(e) => setPaymentData({...paymentData, billingEmail: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.billingEmail ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.billingEmail && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.billingEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Email *
                  </label>
                  <input
                    type="email"
                    placeholder="Confirm your email"
                    value={paymentData.billingEmailConfirm}
                    onChange={(e) => setPaymentData({...paymentData, billingEmailConfirm: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.billingEmailConfirm ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.billingEmailConfirm && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.billingEmailConfirm}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={paymentData.password}
                    onChange={(e) => setPaymentData({...paymentData, password: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Must contain uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={paymentData.passwordConfirm}
                    onChange={(e) => setPaymentData({...paymentData, passwordConfirm: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.passwordConfirm ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.passwordConfirm && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.passwordConfirm}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: formatCardNumber(e.target.value)})}
                  className={`w-full p-3 border rounded-lg font-mono ${paymentErrors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={19}
                />
                {paymentErrors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{paymentErrors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {/* Expiry Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    value={paymentData.expiryMonth}
                    onChange={(e) => setPaymentData({...paymentData, expiryMonth: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">MM</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={String(i+1).padStart(2, '0')}>
                        {String(i+1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiry Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={paymentData.expiryYear}
                    onChange={(e) => setPaymentData({...paymentData, expiryYear: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">YYYY</option>
                    {Array.from({length: 10}, (_, i) => (
                      <option key={i} value={new Date().getFullYear() + i}>
                        {new Date().getFullYear() + i}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                    className={`w-full p-3 border rounded-lg font-mono ${paymentErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                    maxLength={3}
                  />
                  {paymentErrors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.cvv}</p>
                  )}
                </div>
              </div>

              {paymentErrors.expiry && (
                <p className="text-red-500 text-sm mt-2">{paymentErrors.expiry}</p>
              )}

              {/* Name on Card */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name on Card *
                </label>
                <input
                  type="text"
                  placeholder={`${demoData.firstName} ${demoData.lastName}`}
                  value={paymentData.nameOnCard}
                  onChange={(e) => setPaymentData({...paymentData, nameOnCard: e.target.value})}
                  className={`w-full p-3 border rounded-lg ${paymentErrors.nameOnCard ? 'border-red-500' : 'border-gray-300'}`}
                />
                {paymentErrors.nameOnCard && (
                  <p className="text-red-500 text-sm mt-1">{paymentErrors.nameOnCard}</p>
                )}
              </div>
            </div>

            {/* General Error */}
            {paymentErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{paymentErrors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={paymentLoading || paymentStep === 'processing'}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {paymentStep === 'processing' ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `💳 Pay $299/month & Create Account`
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Secure 256-bit SSL encryption • Your account will be created with the email and password you choose
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFromLink;