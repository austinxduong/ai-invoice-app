// frontend/src/pages/Settings.jsx
// Merged: Existing password settings + New Organization settings

import React, { useState } from 'react';
import { Building2, User, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import OrganizationSettings from '../OrganizationSettings';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  
  // Password change state (from your existing code)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // Password validation (from your existing code)
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password change handler (from your existing code)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    setPasswordErrors({});
    setSuccessMessage('');
    
    try {
      const response = await axiosInstance.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setSuccessMessage('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordErrors({
        general: error.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your organization and account settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Organization Tab - NEW! */}
              {activeTab === 'organization' && <OrganizationSettings />}

              {/* Account Tab - Your existing account info */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600">Name</label>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Email</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Company</label>
                        <p className="font-medium">{user?.businessName || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Account Type</label>
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Paid Account
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab - Your existing password change */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className={`w-full p-3 border rounded-lg ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your current password"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className={`w-full p-3 border rounded-lg ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your new password"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Must contain uppercase, lowercase, number, and be at least 8 characters
                      </p>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className={`w-full p-3 border rounded-lg ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Confirm your new password"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    {/* General Error */}
                    {passwordErrors.general && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{passwordErrors.general}</p>
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-600 text-sm">{successMessage}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;