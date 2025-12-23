// frontend/src/utils/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Login user with new multi-tenant auth
 */
export const login = async (email, password) => {
  try {
    // Use the NEW auth endpoint that supports organizations
    const response = await axios.post(`${API_URL}/auth-new/login`, {
      email,
      password
    });

    const { token, user } = response.data;

    // Store token in localStorage
    localStorage.setItem('token', token);
    
    // Store user info (now includes organizationId!)
    localStorage.setItem('user', JSON.stringify(user));

    console.log('✅ Login successful:', user);
    console.log('   Organization:', user.organizationId);
    console.log('   Role:', user.role);

    return { success: true, token, user };
  } catch (error) {
    console.error('❌ Login error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed. Please try again.'
    };
  }
};

/**
 * Register new user/organization (used during payment flow)
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth-new/register`, userData);

    const { token, user } = response.data;

    // Store token and user info
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('✅ Registration successful:', user);

    return { success: true, token, user };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed.'
    };
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('👋 User logged out');
};

/**
 * Get current user from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get organization ID for current user
 */
export const getOrganizationId = () => {
  const user = getUser();
  return user?.organizationId || null;
};

/**
 * Get organization name for current user
 */
export const getOrganizationName = () => {
  const user = getUser();
  return user?.organizationName || null;
};

/**
 * Get user role
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || 'user';
};

/**
 * Check if user is owner
 */
export const isOwner = () => {
  const user = getUser();
  return user?.isOwner || false;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission) => {
  const user = getUser();
  if (!user) return false;
  
  // Owner can do everything
  if (user.isOwner) return true;
  
  // Check specific permission
  return user.permissions?.[permission] || false;
};

/**
 * Get auth token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken() && !!getUser();
};

/**
 * Get current user info from server (refresh)
 */
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await axios.get(`${API_URL}/auth-new/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = response.data.user;
    
    // Update localStorage with fresh data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    
    // If token is invalid, clear auth data
    if (error.response?.status === 401) {
      logout();
    }
    
    return null;
  }
};

/**
 * Verify if token is still valid
 */
export const verifyToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    const response = await axios.post(`${API_URL}/auth-new/verify-token`, {
      token
    });

    return response.data.valid;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export default {
  login,
  register,
  logout,
  getUser,
  getOrganizationId,
  getOrganizationName,
  getUserRole,
  isOwner,
  hasPermission,
  getToken,
  isAuthenticated,
  getCurrentUser,
  verifyToken
};