// DeviceEditModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Laptop, 
  Save, 
  RefreshCw, 
  Cpu, 
  ChevronRight,
  CpuIcon,
  MemoryStick,
  HardDriveIcon,
  MonitorIcon,
  Box,
  DiscIcon,
  Globe
} from 'lucide-react';
import api from '../../api/axios';
import Notification from '../../components/Notification';

export default function DeviceEditModal({ darkMode, onClose, device, onSuccess }) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    processor: '',
    motherboard: '',
    memory: '',
    harddrive: '',
    monitor: '',
    casing: '',
    cdRom: '',
    operatingSystem: '',
    macAddress: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize form data when device changes
  useEffect(() => {
    if (device) {
      setFormData({
        brand: device.brand || '',
        model: device.model || '',
        serialNumber: device.serialNumber || '',
        processor: device.processor || '',
        motherboard: device.motherboard || '',
        memory: device.memory || '',
        harddrive: device.harddrive || '',
        monitor: device.monitor || '',
        casing: device.casing || '',
        cdRom: device.cdRom || '',
        operatingSystem: device.operatingSystem || device.operating_system || '',
        macAddress: device.macAddress || device.mac_address || '',
      });
    }
  }, [device]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        brand: formData.brand || null,
        model: formData.model,
        serial_number: formData.serialNumber || null,
        // Advanced specs (backend may need to be updated to handle these)
        processor: formData.processor || null,
        motherboard: formData.motherboard || null,
        memory: formData.memory || null,
        harddrive: formData.harddrive || null,
        monitor: formData.monitor || null,
        casing: formData.casing || null,
        cd_rom: formData.cdRom || null,
        operating_system: formData.operatingSystem || null,
        mac_address: formData.macAddress || null,
      };
      
      const response = await api.put(`/devices/${device.id}`, updateData);
      
      // Show success notification
      setNotification({
        type: 'success',
        title: 'Changes Saved!',
        message: 'Device updated successfully! The changes are pending admin approval. Your device will appear in the pending status until approved.',
        autoClose: true,
      });

      // Call success callback to refresh device list
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after a short delay to show notification
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating device:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[Object.keys(err.response.data.errors || {})[0]]?.[0] ||
                          'Failed to update device. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const bgClass = darkMode 
    ? 'bg-black/50 backdrop-blur-sm' 
    : 'bg-black/50 backdrop-blur-sm';

  const cardBg = darkMode
    ? 'bg-black border border-white/10 backdrop-blur-xl'
    : 'bg-white border border-gray-200 backdrop-blur-xl';

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const inputBg = darkMode
    ? 'bg-white/10 border-white/20 focus:border-blue-500/50'
    : 'bg-white/60 border-gray-300 focus:border-blue-500';

  if (!device) {
    return null;
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={`fixed inset-0 ${bgClass} z-50 flex items-center justify-center p-3 sm:p-4`}>
        <div className={`${cardBg} rounded-xl sm:rounded-2xl w-full max-w-md sm:max-w-lg h-auto max-h-[90vh] flex flex-col relative z-10`}>
        {/* Header */}
        <div className="border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
              <Laptop className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${textPrimary}`}>Edit Device</h2>
              <p className={`text-xs ${textSecondary}`}>Update device information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <X className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }
          `}</style>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Device Info Section */}
            <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
              <h4 className={`text-base sm:text-lg font-bold ${textPrimary} flex items-center gap-2 mb-4 sm:mb-6`}>
                <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />
                Device Information
              </h4>
              
              <div className="space-y-4 sm:space-y-5">
                {/* Brand */}
                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Dell, Apple, HP"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {/* Model */}
                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., XPS 15, MacBook Pro M2"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="Device serial number"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Advanced Information Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full cursor-pointer p-4 rounded-xl flex items-center justify-between transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <span className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                <Cpu className="w-5 h-5" />
                Advanced Specifications
              </span>
              <ChevronRight className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-90' : ''} ${textSecondary}`} />
            </button>

            {/* Advanced Information */}
            {showAdvanced && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className={`text-sm font-semibold ${textSecondary} uppercase tracking-wider`}>
                  Hardware Specifications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <CpuIcon className="w-4 h-4" />
                      Processor
                    </label>
                    <input
                      type="text"
                      name="processor"
                      value={formData.processor}
                      onChange={handleChange}
                      placeholder="e.g., Intel Core i7-12700H"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <CpuIcon className="w-4 h-4" />
                      Motherboard
                    </label>
                    <input
                      type="text"
                      name="motherboard"
                      value={formData.motherboard}
                      onChange={handleChange}
                      placeholder="e.g., ASUS ROG Strix B660"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <MemoryStick className="w-4 h-4" />
                      Memory (RAM)
                    </label>
                    <input
                      type="text"
                      name="memory"
                      value={formData.memory}
                      onChange={handleChange}
                      placeholder="e.g., 16GB DDR4 3200MHz"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <HardDriveIcon className="w-4 h-4" />
                      Hard Drive / SSD
                    </label>
                    <input
                      type="text"
                      name="harddrive"
                      value={formData.harddrive}
                      onChange={handleChange}
                      placeholder="e.g., 1TB NVMe SSD"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <MonitorIcon className="w-4 h-4" />
                      Monitor
                    </label>
                    <input
                      type="text"
                      name="monitor"
                      value={formData.monitor}
                      onChange={handleChange}
                      placeholder="e.g., 15.6 inch FHD IPS"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <Box className="w-4 h-4" />
                      Casing
                    </label>
                    <input
                      type="text"
                      name="casing"
                      value={formData.casing}
                      onChange={handleChange}
                      placeholder="e.g., Aluminum Chassis"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <DiscIcon className="w-4 h-4" />
                      CD/DVD/ROM
                    </label>
                    <input
                      type="text"
                      name="cdRom"
                      value={formData.cdRom}
                      onChange={handleChange}
                      placeholder="e.g., DVD-RW, Blu-ray"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2 flex items-center gap-2`}>
                      <Globe className="w-4 h-4" />
                      MAC Address
                    </label>
                    <input
                      type="text"
                      name="macAddress"
                      value={formData.macAddress}
                      onChange={handleChange}
                      placeholder="e.g., 00:1A:2B:3C:4D:5E"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Operating System
                  </label>
                  <select
                    name="operatingSystem"
                    value={formData.operatingSystem}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select OS</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="Windows 11">Windows 11</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Linux</option>
                    <option value="Chrome OS">Chrome OS</option>
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Info Notice */}
            <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'} flex items-start gap-2`}>
                <span className="mt-0.5">ℹ️</span>
                <span>When saving changes, please wait for the admin to approve the updates before the changes take effect.</span>
              </p>
            </div>
          </form>
        </div>

        {/* Bottom Buttons */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={loading || !formData.model.trim() || !formData.brand.trim() || !formData.serialNumber.trim()}
              className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

