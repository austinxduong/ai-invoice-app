// frontend/src/pages/OrganizationSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { Clock, MapPin, Save, Info, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (CA, NV, WA)', offset: 'UTC-8/-7' },
  { value: 'America/Denver', label: 'Mountain Time (CO, UT)', offset: 'UTC-7/-6' },
  { value: 'America/Phoenix', label: 'Arizona Time (no DST)', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'Central Time (IL, MI, OK)', offset: 'UTC-6/-5' },
  { value: 'America/New_York', label: 'Eastern Time (NY, MA, FL)', offset: 'UTC-5/-4' },
  { value: 'America/Anchorage', label: 'Alaska Time', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (no DST)', offset: 'UTC-10' },
];

const OrganizationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    name: '',
    timezone: 'America/Los_Angeles',
    businessHours: {
      weekdayOpen: '09:00',
      weekdayClose: '21:00',
      weekendOpen: '10:00',
      weekendClose: '20:00',
      closed: []
    },
    location: {
      facilityName: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      licenseNumber: ''
    }
  });
  
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-US', {
        timeZone: settings.timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(formatted);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [settings.timezone]);

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/organization/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/organization/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClosedDayToggle = (day) => {
    const closed = settings.businessHours.closed || [];
    const newClosed = closed.includes(day)
      ? closed.filter(d => d !== day)
      : [...closed, day];
    
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        closed: newClosed
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Settings</h2>
        <p className="text-gray-600">Configure your organization's timezone and business hours</p>
      </div>

      {/* Timezone Settings */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Timezone</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Current time in selected timezone:</p>
              <p className="text-lg font-semibold text-blue-700">{currentTime}</p>
              <p className="text-xs text-blue-600 mt-2">
                All dates and times in your system will be displayed in this timezone. 
                UTC timestamps are stored in the database for compliance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Weekday Hours (Mon-Fri)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={settings.businessHours.weekdayOpen}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...settings.businessHours, weekdayOpen: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={settings.businessHours.weekdayClose}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...settings.businessHours, weekdayClose: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Weekend Hours (Sat-Sun)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={settings.businessHours.weekendOpen}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...settings.businessHours, weekendOpen: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={settings.businessHours.weekendClose}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...settings.businessHours, weekendClose: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Closed Days</h3>
          <div className="flex flex-wrap gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
              const isClosed = settings.businessHours.closed?.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => handleClosedDayToggle(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isClosed
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Facility Location */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Facility Location</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">This is your physical dispensary/facility location</p>
              <p className="text-blue-700">
                Used for timezone, business hours, compliance reporting, delivery zones, and POS receipts. 
                <span className="font-medium"> For invoice billing address, update your Profile → Business Information.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.location.facilityName}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, facilityName: e.target.value }
              })}
              placeholder="Green Leaf Dispensary"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">This will appear on POS receipts</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Address</label>
            <input
              type="text"
              value={settings.location.address}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, address: e.target.value }
              })}
              placeholder="123 Dispensary Blvd, Suite 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={settings.location.city}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, city: e.target.value }
              })}
              placeholder="Los Angeles"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={settings.location.state}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, state: e.target.value }
              })}
              maxLength={2}
              placeholder="CA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={settings.location.zip}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, zip: e.target.value }
              })}
              placeholder="90001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={settings.location.phone}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, phone: e.target.value }
              })}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Appears on receipts</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              value={settings.location.licenseNumber}
              onChange={(e) => setSettings({
                ...settings,
                location: { ...settings.location, licenseNumber: e.target.value }
              })}
              placeholder="ABC123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">State cannabis license number (appears on receipts)</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrganizationSettings;