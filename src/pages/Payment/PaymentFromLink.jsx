import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../../utils/axiosInstance';
import { Users, Minus, Plus } from 'lucide-react';

// ✅ Use Stripe publishable key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: false,
};

// ✅ Number flip animation component
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  return (
    <span className="inline-block transition-all duration-300 ease-out">
      ${displayValue.toLocaleString()}
    </span>
  );
};

// Inner payment form component
const PaymentFormContent = ({ demoData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // ✅ License quantity state
  const [licenseQuantity, setLicenseQuantity] = useState(1);
  const PRICE_PER_LICENSE = 299;
  const monthlyTotal = licenseQuantity * PRICE_PER_LICENSE;
  
  // ✅ Separate billing and account emails
  const [paymentData, setPaymentData] = useState({
    // Billing information
    billingEmail: demoData.email,
    billingEmailConfirm: demoData.email,
    
    // Account/Login information
    accountEmail: demoData.email,
    accountEmailConfirm: demoData.email,
    
    // Account credentials
    password: '',
    passwordConfirm: '',
    
    // Payment info
    nameOnCard: `${demoData.firstName} ${demoData.lastName}`,
  });
  
  const [paymentErrors, setPaymentErrors] = useState({});

  // ✅ License quantity handlers
  const incrementLicenses = () => {
    if (licenseQuantity < 100) {
      setLicenseQuantity(prev => prev + 1);
    }
  };
  
  const decrementLicenses = () => {
    if (licenseQuantity > 1) {
      setLicenseQuantity(prev => prev - 1);
    }
  };

  const validatePaymentForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // ✅ Billing Email validation
    if (!paymentData.billingEmail || !emailRegex.test(paymentData.billingEmail)) {
      errors.billingEmail = 'Please enter a valid billing email';
    }
    
    if (paymentData.billingEmail !== paymentData.billingEmailConfirm) {
      errors.billingEmailConfirm = 'Billing emails do not match';
    }
    
    // ✅ Account Email validation
    if (!paymentData.accountEmail || !emailRegex.test(paymentData.accountEmail)) {
      errors.accountEmail = 'Please enter a valid account email';
    }
    
    if (paymentData.accountEmail !== paymentData.accountEmailConfirm) {
      errors.accountEmailConfirm = 'Account emails do not match';
    }
    
    // Password validation
    if (!paymentData.password) {
      errors.password = 'Password is required';
    } else if (paymentData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(paymentData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (paymentData.password !== paymentData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
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
  
  // Prevent double submission
  if (paymentLoading || paymentStep === 'processing') {
    return;
  }
  
  if (!validatePaymentForm()) {
    return;
  }

  if (!stripe || !elements) {
    setPaymentErrors({ general: 'Stripe is not loaded yet. Please wait a moment and try again.' });
    return;
  }
  
  setPaymentLoading(true);
  setPaymentStep('processing');
  
  try {
    // ✅ STEP 0: Check if email already exists BEFORE charging
    console.log('🔍 Checking if account email already exists...');
    try {
      await axiosInstance.post('/payment/check-email', {
        accountEmail: paymentData.accountEmail
      });
      console.log('✅ Email is available');
    } catch (emailCheckError) {
      // Email already exists!
      throw new Error(emailCheckError.response?.data?.error || 'Email is already registered');
    }
    
    // ✅ STEP 1: Create payment intent
    console.log('💳 Creating payment intent...');
    const idempotencyKey = `${demoData.demoId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const { data: intentData } = await axiosInstance.post('/payment/create-payment-intent', {
      amount: monthlyTotal * 100,
      currency: 'usd',
      demoId: demoData.demoId,
      billingEmail: paymentData.billingEmail,
      licenseQuantity: licenseQuantity,
      idempotencyKey: idempotencyKey,
    });

    if (!intentData.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    console.log('✅ Payment intent created');

    // ✅ STEP 2: Confirm payment with Stripe
    console.log('💳 Confirming payment with Stripe...');
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      intentData.clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: paymentData.nameOnCard,
            email: paymentData.billingEmail,
          },
        },
      }
    );

    if (stripeError) {
      throw new Error(stripeError.message);
    }

    console.log('✅ Payment confirmed:', paymentIntent.id);

    // ✅ STEP 3: Create account
    if (paymentIntent.status === 'succeeded') {
      console.log('🎉 Creating organization & account...');
      const { data: accountData } = await axiosInstance.post('/payment/create-account', {
        companyName: demoData.companyName,
        licenseQuantity: licenseQuantity,
        monthlyAmount: monthlyTotal,
        accountEmail: paymentData.accountEmail,
        password: paymentData.password,
        firstName: demoData.firstName,
        lastName: demoData.lastName,
        billingEmail: paymentData.billingEmail,
        paymentLinkId: demoData.demoId,
        paymentIntentId: paymentIntent.id,
        stripeCustomerId: intentData.customerId,
        cardLast4: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4 || 'xxxx',
      });

      if (accountData.success) {
        setPaymentStep('success');
        
        const orgCode = accountData.organizationId;
        
        setTimeout(() => {
          alert(`🎉 Payment Successful & Account Created!

Organization: ${demoData.companyName}
Organization ID: ${orgCode}
Licenses: ${licenseQuantity} user${licenseQuantity > 1 ? 's' : ''}
Monthly Cost: $${monthlyTotal}

Your Login Credentials:
Email: ${paymentData.accountEmail}
Password: [The password you created]

Billing receipts will be sent to: ${paymentData.billingEmail}

Next Steps:
1. Login to your account
2. Complete your company profile
3. Invite your team members!

You can now login to access your platform!`);
          navigate('/login?account=created');
        }, 2000);
      } else {
        throw new Error(accountData.error || 'Account creation failed');
      }
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

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">Payment Successful!</h2>
          <p className="text-green-700 mb-2">Your organization has been created!</p>
          <p className="text-sm text-green-600 mb-4">Check your email for login details and next steps</p>
          <div className="animate-pulse text-sm text-green-600">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
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

          {/* ✅ License Quantity Selector */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select User Licenses</h3>
              </div>
              <p className="text-sm text-gray-600">
                ${PRICE_PER_LICENSE} per user/month • Cancel anytime
              </p>
            </div>

            {/* License Counter */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={decrementLicenses}
                disabled={licenseQuantity <= 1}
                className="w-12 h-12 rounded-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[120px]">
                <div className="text-4xl font-bold text-green-600">{licenseQuantity}</div>
                <div className="text-sm text-gray-600">
                  {licenseQuantity === 1 ? 'user' : 'users'}
                </div>
              </div>
              
              <button
                type="button"
                onClick={incrementLicenses}
                disabled={licenseQuantity >= 100}
                className="w-12 h-12 rounded-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Monthly Total with Animation */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                <AnimatedNumber value={monthlyTotal} />
                <span className="text-lg">/month</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                30-day money-back guarantee
              </div>
            </div>

            {/* Team Member Info */}
            {licenseQuantity > 1 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>After payment:</strong> You'll be able to invite {licenseQuantity - 1} team member{licenseQuantity > 2 ? 's' : ''} from your dashboard. They'll set their own passwords!
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* ✅ Billing Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">📧 Billing Information</h3>
              <p className="text-sm text-gray-600 mb-4">Invoices and receipts will be sent here</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Email *
                  </label>
                  <input
                    type="email"
                    placeholder="billing@company.com"
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
                    Confirm Billing Email *
                  </label>
                  <input
                    type="email"
                    placeholder="Confirm billing email"
                    value={paymentData.billingEmailConfirm}
                    onChange={(e) => setPaymentData({...paymentData, billingEmailConfirm: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.billingEmailConfirm ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.billingEmailConfirm && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.billingEmailConfirm}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Account/Login Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🔐 Account Login Information</h3>
              <p className="text-sm text-gray-600 mb-4">You'll use this email to login to your account</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Email *
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@company.com"
                    value={paymentData.accountEmail}
                    onChange={(e) => setPaymentData({...paymentData, accountEmail: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.accountEmail ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.accountEmail && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.accountEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Account Email *
                  </label>
                  <input
                    type="email"
                    placeholder="Confirm account email"
                    value={paymentData.accountEmailConfirm}
                    onChange={(e) => setPaymentData({...paymentData, accountEmailConfirm: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${paymentErrors.accountEmailConfirm ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {paymentErrors.accountEmailConfirm && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.accountEmailConfirm}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={paymentData.password}
                      onChange={(e) => setPaymentData({...paymentData, password: e.target.value})}
                      className={`w-full p-3 pr-12 border rounded-lg ${paymentErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
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
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={paymentData.passwordConfirm}
                      onChange={(e) => setPaymentData({...paymentData, passwordConfirm: e.target.value})}
                      className={`w-full p-3 pr-12 border rounded-lg ${paymentErrors.passwordConfirm ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswordConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {paymentErrors.passwordConfirm && (
                    <p className="text-red-500 text-sm mt-1">{paymentErrors.passwordConfirm}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">💳 Payment Information</h3>

              {/* Name on Card */}
              <div className="mb-4">
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

              {/* Stripe Card Element */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Details *
                </label>
                <div className="p-3 border border-gray-300 rounded-lg bg-white">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💳 Powered by Stripe - Your card information is securely processed
                </p>
              </div>
            </div>

            {/* General Error */}
            {paymentErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{paymentErrors.general}</p>
              </div>
            )}

            {/* Submit Button with Dynamic Total */}
            <button
              type="submit"
              disabled={!stripe || paymentLoading || paymentStep === 'processing'}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {paymentStep === 'processing' ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `💳 Pay $${monthlyTotal.toLocaleString()}/month & Create Account`
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Secure 256-bit SSL encryption powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

// Main wrapper component
const PaymentFromLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 Validating token:', token);
        const response = await axiosInstance.get(`/payment/validate/${token}`);
        console.log('✅ Token validated:', response.data);
        setDemoData(response.data);
      } catch (error) {
        console.error('❌ Invalid payment link:', error);
        setTimeout(() => navigate('/demo'), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    validateToken();
  }, [token, navigate]);

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

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent demoData={demoData} />
    </Elements>
  );
};

export default PaymentFromLink;