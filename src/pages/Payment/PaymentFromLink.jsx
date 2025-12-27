import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../../utils/axiosInstance';

// Replace with your actual Stripe publishable key
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

// Inner payment form component (uses Stripe Elements)
const PaymentFormContent = ({ demoData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    nameOnCard: `${demoData.firstName} ${demoData.lastName}`,
    billingEmail: demoData.email,
    billingEmailConfirm: demoData.email,
    password: '',
    passwordConfirm: ''
  });
  
  const [paymentErrors, setPaymentErrors] = useState({});

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

    if (!stripe || !elements) {
      setPaymentErrors({ general: 'Stripe is not loaded yet. Please wait a moment and try again.' });
      return;
    }
    
    setPaymentLoading(true);
    setPaymentStep('processing');
    
    try {
      // Step 1: Create payment intent on your backend
      console.log('💳 Creating payment intent...');
      const { data: intentData } = await axiosInstance.post('/payment/create-payment-intent', {
        amount: 29900, // $299.00 in cents
        currency: 'usd',
        demoId: demoData.demoId,
        email: paymentData.billingEmail,
      });

      if (!intentData.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      console.log('✅ Payment intent created');

      // Step 2: Confirm payment with Stripe
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

      // Step 3: Payment successful, create account
      if (paymentIntent.status === 'succeeded') {
        console.log('🎉 Creating user account...');
        const { data: accountData } = await axiosInstance.post('/payment/create-account', {
          email: paymentData.billingEmail,
          firstName: demoData.firstName,
          lastName: demoData.lastName,
          company: demoData.companyName,
          password: paymentData.password,
          paymentLinkId: demoData.demoId,
          paymentIntentId: paymentIntent.id,
          paymentData: {
            cardLast4: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4 || 'xxxx',
            paymentAmount: 299,
            currency: 'USD',
            paymentMethod: 'card',
            stripeCustomerId: intentData.customerId,
          }
        });

        if (accountData.success) {
          setPaymentStep('success');
          
          setTimeout(() => {
            alert(`🎉 Payment Successful & Account Created!\n\nYour login credentials:\nEmail: ${paymentData.billingEmail}\nPassword: [The password you created]\n\nYou can now login to access your cannabis ERP platform!`);
            navigate('/login?account=created');
          }, 1500);
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                    >
                      {showPasswordConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>

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

            {/* Submit Button */}
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
                `💳 Pay $299/month & Create Account`
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