import React, { useState, useEffect, useCallback } from 'react';
import { useQRCode } from '../../hooks/useQRCode';
import { authService } from '../../services/authService';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import StudentSettingsModal from './StudentSettingsModal';
import DeviceEditModal from './DeviceEditModal';
import DeviceRenewModal from './DeviceRenewModal';
import Loading from '../../components/Loading';
import LoadingModal from '../../components/LoadingModal';
import Notification from '../../components/Notification';
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion
import { 
  QrCode, 
  Laptop,
  Pencil,
  Trash2, 
  Plus, 
  Download, 
  Settings, 
  LogOut, 
  Bell, 
  Moon, 
  Sun,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  X,
  Upload,
  MapPin,
  User,
  Shield,
  Cpu,
  HardDrive,
  Monitor,
  Package,
  Disc,
  CpuIcon,
  MemoryStick,
  HardDriveIcon,
  MonitorIcon,
  Box,
  DiscIcon,
  Globe,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

function Register({ darkMode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    // deviceType: 'Laptop',
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
    modelNumber: '',
    macAddress: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Map form data to API format
      const deviceData = {
        device_type: formData.deviceType,
        brand: formData.brand || null,
        model: formData.model || null,
        serial_number: formData.serialNumber || null,
        processor: formData.processor || null,
        motherboard: formData.motherboard || null,
        memory: formData.memory || null,
        harddrive: formData.harddrive || null,
        monitor: formData.monitor || null,
        casing: formData.casing || null,
        cd_rom: formData.cdRom || null,
        operating_system: formData.operatingSystem || null,
        model_number: formData.modelNumber || null,
        mac_address: formData.macAddress || null,
        notes: formData.notes || null
      };

      const response = await api.post('/devices', deviceData);
      
      // Reset form
      setFormData({
        // deviceType: '',
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
        modelNumber: '',
        macAddress: '',
        notes: ''
      });

      // Call success callback to refresh device list
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error registering device:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[Object.keys(err.response.data.errors || {})[0]]?.[0] ||
                          'Failed to register device. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputBg = darkMode ? 'bg-black border-gray/20' : 'bg-white/60 border-gray/40';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  // Custom scrollbar styles based on dark mode
  const scrollbarStyles = darkMode ? 
    `scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30` :
    `scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 hover:scrollbar-thumb-gray-400`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`
        ${darkMode ? 'bg-black' : 'bg-white'} 
        rounded-2xl 
        w-full 
        max-w-md 
        shadow-2xl 
        border 
        ${darkMode ? 'border-white/10' : 'border-gray-200'} 
        max-h-[90vh]
        overflow-hidden
        flex 
        flex-col
      `}>
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-6 border-b" style={{ 
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: darkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Register Device</h2>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable area */}
        <div className={`flex-1 overflow-y-auto ${scrollbarStyles}`}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${textPrimary} flex items-center gap-2`}>
                <Laptop className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                  Device Type
                </label>
                <select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} ${textPrimary} font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Laptop">Laptop</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                  Brand
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

              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                  Model
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

              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="Device serial number"
                  className={`w-full px-4 py-2.5 rounded-lg border border-gray-500 ${inputBg} ${textPrimary} placeholder-gray-500 font-medium transition-all focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>

            </div>

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
                      placeholder="e.g., 15.6\" 
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

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 p-6 border-t" style={{
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: darkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Device'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tutorial Component
function TutorialGuide({ darkMode, onClose, currentStep, onNext, onPrev, onComplete }) {
  const steps = [
    {
      title: "Welcome to DevPass! 👋",
      description: "Let's walk through how to manage your devices and campus access.",
      target: "welcome",
      position: "center"
    },
    {
      title: "Register Your First Device",
      description: "Click 'Register New Device' to add your laptop, phone, or other devices for campus access.",
      target: "register-button",
      position: "bottom"
    },
    {
      title: "Device Management",
      description: "Here you can view all your registered devices, check their status, and download QR codes.",
      target: "devices-tab",
      position: "bottom"
    },
    {
      title: "Track Your Activity",
      description: "Switch to 'Recent Activity' tab to see all your campus entry records.",
      target: "activity-tab",
      position: "bottom"
    },
    {
      title: "QR Code Access",
      description: "Each device gets a unique QR code. Show this at campus gates for quick access.",
      target: "qrcode-section",
      position: "left"
    },
    {
      title: "Renew Your Devices",
      description: "Renew device access every 30 days to keep your QR codes active.",
      target: "renew-button",
      position: "top"
    },
    {
      title: "Settings & Profile",
      description: "Access your profile and settings from the top navigation.",
      target: "settings-button",
      position: "left"
    },
    {
      title: "You're All Set! 🎉",
      description: "Start by registering your first device. Need help? Look for the help button anytime!",
      target: "complete",
      position: "center"
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTargetElement = () => {
    if (currentStepData.target === "welcome" || currentStepData.target === "complete") {
      return null;
    }
    return document.querySelector(`[data-tutorial="${currentStepData.target}"]`);
  };

  const targetElement = getTargetElement();
  
  const renderHighlight = () => {
    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 pointer-events-none z-50"
      >
        {/* Highlight overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]">
          {/* Cutout for target element */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="cutout-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cutout-mask)" />
          </svg>
        </div>
        
        {/* Glow effect */}
        <div 
          className="absolute border-2 border-blue-400/50 rounded-xl shadow-[0_0_30px_5px_rgba(59,130,246,0.5)]"
          style={{
            left: `${rect.x - 4}px`,
            top: `${rect.y - 4}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
          }}
        />
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Highlight overlay */}
        {targetElement && renderHighlight()}

        {/* Tutorial card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className={`fixed ${
            currentStepData.position === "center" 
              ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              : currentStepData.position === "bottom"
              ? targetElement 
                ? `top-[${targetElement.getBoundingClientRect().bottom + 20}px] left-[${targetElement.getBoundingClientRect().left}px]`
                : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              : currentStepData.position === "top"
              ? targetElement
                ? `bottom-[${window.innerHeight - targetElement.getBoundingClientRect().top + 20}px] left-[${targetElement.getBoundingClientRect().left}px]`
                : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              : currentStepData.position === "left"
              ? targetElement
                ? `top-[${targetElement.getBoundingClientRect().top}px] right-[${window.innerWidth - targetElement.getBoundingClientRect().right + 20}px]`
                : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          } ${targetElement ? '' : 'transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'}`}
          style={{
            width: 'min(90vw, 400px)',
            ...(targetElement && currentStepData.position === "bottom" && {
              top: `${targetElement.getBoundingClientRect().bottom + 20}px`,
              left: `${targetElement.getBoundingClientRect().left}px`,
              transform: 'translateX(0)'
            }),
            ...(targetElement && currentStepData.position === "top" && {
              bottom: `${window.innerHeight - targetElement.getBoundingClientRect().top + 20}px`,
              left: `${targetElement.getBoundingClientRect().left}px`,
              transform: 'translateX(0)'
            }),
            ...(targetElement && currentStepData.position === "left" && {
              top: `${targetElement.getBoundingClientRect().top}px`,
              right: `${window.innerWidth - targetElement.getBoundingClientRect().right + 20}px`,
              transform: 'translateY(0)'
            })
          }}
        >
          <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl border p-6`}>
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <HelpCircle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>

            {/* Step content */}
            <div className="mb-6">
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentStepData.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentStepData.description}
              </p>
            </div>

            {/* Step indicator dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {}}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-500 w-4'
                      : darkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {!isFirstStep && (
                <button
                  onClick={onPrev}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                    darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } flex items-center justify-center gap-2`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              
              {isLastStep ? (
                <button
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold ${
                    darkMode
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                  } text-white transition-all flex items-center justify-center gap-2`}
                >
                  <Check className="w-4 h-4" />
                  Get Started
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('devices');
  const [showRegister, setShowRegister] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [student, setStudent] = useState(null);
  const [devices, setDevices] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [deviceToRenew, setDeviceToRenew] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [previousDeviceStatuses, setPreviousDeviceStatuses] = useState({});
  const [shownNotifications, setShownNotifications] = useState(() => {
    // Initialize from sessionStorage to persist across page refreshes within the same session
    try {
      const stored = sessionStorage.getItem('shownNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  }); // Track shown notifications
  
  // Tutorial states
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  // Get student info from storage or API (only once on mount)
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Get from storage first (checks both localStorage and sessionStorage)
        const storedStudent = authService.getCurrentStudent();
        if (storedStudent) {
          setStudent(storedStudent);
          setLoading(false);
        } else {
          // If not in storage, fetch from API
          try {
          const response = await api.get('/auth/profile');
            // Handle both wrapped and unwrapped formats for backward compatibility
            const studentData = response.data?.student || response.data;
            if (studentData) {
              setStudent(studentData);
          // Store in the same storage type as the token
          const token = authService.getToken();
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
              storage.setItem('student', JSON.stringify(studentData));
            } else {
              console.error('No student data in response:', response.data);
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            // If not authenticated, redirect to login
            if (profileError.response?.status === 401) {
              navigate('/');
              return;
            }
            // If profile fetch fails but user is authenticated, try to continue with stored data
            const fallbackStudent = authService.getCurrentStudent();
            if (fallbackStudent) {
              setStudent(fallbackStudent);
            }
          }
        }
          
          // Check if tutorial was completed
          const hasCompletedTutorial = localStorage.getItem('tutorial_completed');
          setTutorialCompleted(hasCompletedTutorial === 'true');
      } catch (error) {
        console.error('Error loading student data:', error);
        // If not authenticated, redirect to login
        if (error.response?.status === 401) {
          navigate('/');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [navigate]);

  // Fetch devices only when 'devices' tab is active
  useEffect(() => {
    if (activeTab === 'devices' && student && !loadingDevices) {
      const fetchDevices = async () => {
        try {
          setLoadingDevices(true);
            const devicesResponse = await api.get('/devices');
            const userDevices = devicesResponse.data || [];
            setDevices(userDevices);
            
          // Check if tutorial should be shown
          const hasCompletedTutorial = localStorage.getItem('tutorial_completed');
          if (userDevices.length === 0 && hasCompletedTutorial !== 'true') {
              setTimeout(() => {
                setShowTutorial(true);
              }, 1000);
            }
          } catch (error) {
            console.error('Error fetching devices:', error);
            setDevices([]);
        } finally {
          setLoadingDevices(false);
        }
      };
      fetchDevices();
    }
  }, [activeTab, student]);

  // Fetch device history only when history tab is active
  useEffect(() => {
    if (activeTab === 'history' && student && !loadingHistory) {
      const fetchHistory = async () => {
        try {
          setLoadingHistory(true);
          const historyResponse = await api.get('/devices/history');
          setDeviceHistory(historyResponse.data || []);
        } catch (error) {
          console.error('Error fetching device history:', error);
          setDeviceHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, student]);

  // Fetch activity only when activity tab is active
  useEffect(() => {
    if (activeTab === 'activity' && student && !loadingActivity) {
      const fetchActivity = async () => {
        try {
          setLoadingActivity(true);
          const activityResponse = await api.get('/entries/student-activity?limit=10');
          setRecentActivity(activityResponse.data || []);
        } catch (error) {
          console.error('Error fetching recent activity:', error);
          setRecentActivity([]);
        } finally {
          setLoadingActivity(false);
        }
      };
      fetchActivity();
    }
  }, [activeTab, student]);

  // Centralized refresh function to update all relevant data
  const refreshDashboardData = useCallback(async (refreshAll = false) => {
    try {
      const promises = [];
      
      // Always refresh student profile data to pick up admin changes
      promises.push(
        api.get('/auth/profile')
          .then(res => {
            const studentData = res.data?.student || res.data;
            return { type: 'student', data: studentData };
          })
          .catch(err => {
            console.error('Error refreshing student profile:', err);
            return { type: 'student', data: null };
          })
      );
      
      // Refresh data based on active tab or if refreshAll is true
      if (refreshAll || activeTab === 'devices') {
        promises.push(api.get('/devices').then(res => ({ type: 'devices', data: res.data })));
      }
      if (refreshAll || activeTab === 'activity') {
        promises.push(api.get('/entries/student-activity?limit=10').then(res => ({ type: 'activity', data: res.data })));
      }
      if (refreshAll || activeTab === 'history') {
        promises.push(api.get('/devices/history').then(res => ({ type: 'history', data: res.data })));
      }
      
      if (promises.length === 0) return;
      
      const results = await Promise.all(promises);
      
      let currentDevices = devices;
      
      results.forEach(result => {
        if (result.type === 'student' && result.data) {
          const updatedStudent = result.data.student || result.data;
          setStudent(prevStudent => {
            if (prevStudent && 
                prevStudent.id === updatedStudent.id &&
                prevStudent.name === updatedStudent.name &&
                prevStudent.email === updatedStudent.email &&
                prevStudent.phone === updatedStudent.phone &&
                prevStudent.course_id === updatedStudent.course_id &&
                prevStudent.year_of_study === updatedStudent.year_of_study) {
              return prevStudent;
            }
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('student', JSON.stringify(updatedStudent));
            return updatedStudent;
          });
        } else if (result.type === 'devices') {
          currentDevices = result.data || [];
          setDevices(currentDevices);
        } else if (result.type === 'activity') {
          setRecentActivity(result.data || []);
        } else if (result.type === 'history') {
          setDeviceHistory(result.data || []);
        }
      });
      
      // Check for device status changes and show notifications
      if (currentDevices.length > 0) {
        setPreviousDeviceStatuses(prev => {
          const isFirstLoad = Object.keys(prev).length === 0;
          
          currentDevices.forEach(device => {
            const previous = prev[device.id];
            const currentHasPending = device.hasPendingChanges || false;
            const currentLastAction = device.lastAction || null;
            const previousLastAction = previous?.lastAction || null;
            const previousHasPending = previous?.hasPendingChanges || false;
            const previousStatus = previous?.status;
            
            // If device was edited (went from active to pending), clear old notifications for this device
            if (previous && previousStatus === 'active' && device.status === 'pending' && currentHasPending) {
              setShownNotifications(prevNotifs => {
                const newSet = new Set([...prevNotifs].filter(key => !key.startsWith(`${device.id}-`)));
                try {
                  sessionStorage.setItem('shownNotifications', JSON.stringify([...newSet]));
                } catch (e) {
                  console.error('Failed to update shownNotifications:', e);
                }
                return newSet;
              });
            }
            
            // Create a unique key for this notification
            const approvedAt = device.approvedAt || device.approved_at || null;
            const timestamp = approvedAt ? new Date(approvedAt).getTime() : (device.updatedAt ? new Date(device.updatedAt).getTime() : Date.now());
            const notificationKey = currentLastAction ? `${device.id}-${currentLastAction}-${timestamp}` : null;
            
            // Create previous notification key for comparison
            const previousApprovedAt = previous?.approvedAt || previous?.approved_at || null;
            const previousTimestamp = previousApprovedAt ? new Date(previousApprovedAt).getTime() : (previous?.updatedAt ? new Date(previous.updatedAt).getTime() : null);
            const previousNotificationKey = previousLastAction ? `${device.id}-${previousLastAction}-${previousTimestamp}` : null;
            
            // Check if we should show notification
            let shouldShowNotification = false;
            
            if (previous) {
              // Case 1: Device was pending (with changes) and is now active (approved/rejected)
              const wasPendingWithChanges = previousStatus === 'pending' && previousHasPending;
              const isNowActive = device.status === 'active' && !currentHasPending;
              const statusChangedToActive = wasPendingWithChanges && isNowActive;
              
              // Case 2: Device is active and lastAction changed (NEW action)
              const lastActionChanged = previousLastAction !== currentLastAction;
              const lastActionNowSet = currentLastAction !== null;
              const isActiveWithNewAction = device.status === 'active' && lastActionNowSet;
              
              // Case 3: Same lastAction but different timestamp (new approval/rejection cycle)
              const sameActionButNewTimestamp = previousLastAction === currentLastAction && 
                                                previousLastAction !== null && 
                                                timestamp !== previousTimestamp;
              
              // Show notification if:
              // 1. Status changed from pending (with changes) to active (this means it was just approved/rejected), OR
              // 2. Device is active and lastAction changed (new action), OR
              // 3. Same action but different timestamp (new approval/rejection cycle)
              shouldShowNotification = (statusChangedToActive || 
                  (lastActionChanged && isActiveWithNewAction) ||
                  sameActionButNewTimestamp) && 
                  currentLastAction !== null;
              
              // IMPORTANT: Also check if this notification key is different from the previous one
              if (shouldShowNotification && notificationKey === previousNotificationKey) {
                shouldShowNotification = false;
              }
            } else if (isFirstLoad && currentLastAction) {
              // No previous state - this is first time seeing this device
              // Only show notification if device is NOT pending (i.e., already processed)
              const isNewRegistration = device.status === 'pending' && !device.hasPendingChanges;
              const isProcessedDevice = device.status === 'active' || device.status === 'rejected';
              
              // Show notification only for processed devices, not new registrations
              shouldShowNotification = !isNewRegistration && isProcessedDevice;
            }
            
            // Check if notification should be shown using functional update
            if (shouldShowNotification && notificationKey) {
              setShownNotifications(prevNotifs => {
                const hasBeenShown = prevNotifs.has(notificationKey);
                
                if (!hasBeenShown) {
                  // Mark as shown IMMEDIATELY to prevent duplicate notifications
                  const newSet = new Set([...prevNotifs, notificationKey]);
                  try {
                    sessionStorage.setItem('shownNotifications', JSON.stringify([...newSet]));
                  } catch (e) {
                    console.error('Failed to save shownNotifications to sessionStorage:', e);
                  }
                  
                  // Check lastAction to determine if approved or rejected
                  let notificationData = null;
                  if (currentLastAction === 'reverted') {
                    // Changes were rejected and reverted
                    notificationData = {
                      type: 'error',
                      title: 'Changes Rejected',
                      message: `Your changes to ${device.brand} ${device.model} have been rejected. The device has been restored to its original values.`,
                      autoClose: true,
                    };
                  } else if (currentLastAction === 'changes_approved') {
                    // Changes to an active device were approved
                    notificationData = {
                      type: 'success',
                      title: 'Changes Approved!',
                      message: `Your changes to ${device.brand} ${device.model} have been approved by the admin.`,
                      autoClose: true,
                    };
                  } else if (currentLastAction === 'approved') {
                    // New device registration was approved
                    notificationData = {
                      type: 'success',
                      title: 'Device Approved!',
                      message: `Your device ${device.brand} ${device.model} has been approved by the admin.`,
                      autoClose: true,
                    };
                  } else if (currentLastAction === 'rejected') {
                    // New device registration was rejected
                    notificationData = {
                      type: 'error',
                      title: 'Device Rejected',
                      message: `Your device registration for ${device.brand} ${device.model} has been rejected.`,
                      autoClose: true,
                    };
                  } else if (currentLastAction === 'renewed') {
                    // QR code renewal was approved
                    notificationData = {
                      type: 'success',
                      title: 'QR Code Renewed!',
                      message: `Your QR code for ${device.brand} ${device.model} has been renewed by the admin.`,
                      autoClose: true,
                    };
                  } else if (currentLastAction === 'renewal_rejected') {
                    // QR code renewal was rejected
                    notificationData = {
                      type: 'error',
                      title: 'Renewal Rejected',
                      message: `Your QR code renewal request for ${device.brand} ${device.model} has been rejected.`,
                      autoClose: true,
                    };
                  }
                  
                  if (notificationData) {
                    // Use setTimeout to ensure state update happens after this callback
                    setTimeout(() => {
                      setNotification(notificationData);
                    }, 0);
                  }
                  
                  return newSet;
                }
                
                return prevNotifs;
              });
            }
          });
          
          // Return updated previousDeviceStatuses
          const updated = { ...prev };
          currentDevices.forEach(device => {
            updated[device.id] = {
              status: device.status,
              lastAction: device.lastAction,
              hasPendingChanges: device.hasPendingChanges,
              approvedAt: device.approvedAt || device.approved_at,
              updatedAt: device.updatedAt
            };
          });
          return updated;
        });
        }
      } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  }, [activeTab, devices, shownNotifications]);

  // Poll for changes periodically (every 3 seconds) to detect admin actions
  useEffect(() => {
    if (!student) return;

    const pollForChanges = async () => {
      try {
        // Always check devices for notifications, even if on a different tab
        // This ensures we catch admin approvals/rejections regardless of active tab
        await refreshDashboardData(true);
      } catch (error) {
        console.error('Error polling for changes:', error);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollForChanges, 3000);

    return () => clearInterval(interval);
  }, [student, refreshDashboardData]);

  // Handlers for device actions
  const handleEditDevice = (device) => {
    setSelectedDevice(device);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    // Refresh all data after successful edit
    await refreshDashboardData(true);
  };

  const handleDeleteDevice = (device) => {
    setDeviceToDelete(device);
    setShowDeleteModal(true);
  };

  const confirmDeleteDevice = async () => {
    if (!deviceToDelete) return;
    
    try {
      await api.delete(`/devices/${deviceToDelete.id}`);
      
      setNotification({
        type: 'success',
        title: 'Device Deleted',
        message: `${deviceToDelete.brand} ${deviceToDelete.model} has been deleted successfully.`,
        autoClose: true,
      });
      
      // Close modal
      setShowDeleteModal(false);
      setDeviceToDelete(null);
      
      // Refresh all data after successful delete
      await refreshDashboardData(true);
    } catch (error) {
      console.error('Error deleting device:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete device';
      setNotification({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage,
        autoClose: true,
      });
    }
  };

  const handleRenewQR = (device) => {
    setDeviceToRenew(device);
    setShowRenewModal(true);
  };

  const handleRenewSuccess = async () => {
    // Refresh all data after successful renewal
    await refreshDashboardData(true);
  };

  // Add this helper function to calculate if renew button should be disabled
  const calculateDaysSinceRegistration = (device) => {
    if (!device.created_at && !device.registered_date) return 0;
    
    try {
      // Try to get the registration date from various possible properties
      const registrationDateStr = device.created_at || device.registered_date || device.registration_date;
      if (!registrationDateStr) return 0;
      
      const registrationDate = new Date(registrationDateStr);
      const currentDate = new Date();
      
      // Calculate difference in days
      const diffTime = currentDate.getTime() - registrationDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Error calculating days since registration:', error);
      return 0;
    }
  };

  const isRenewDisabled = (device) => {
    // Check if QR code is expired (not based on registration date)
    if (!device.qrExpiry) {
      return true; // No QR code, can't renew
    }
    
    try {
      const expiryDate = new Date(device.qrExpiry);
      const currentDate = new Date();
      // Only enable if QR code is expired (expiry date is in the past)
      return expiryDate > currentDate;
    } catch (error) {
      console.error('Error checking QR expiry:', error);
      return true; // Disable on error
    }
  };

  const getRenewTooltip = (device) => {
    if (!device.qrExpiry) {
      return 'No QR code found';
    }
    
    try {
      const expiryDate = new Date(device.qrExpiry);
      const currentDate = new Date();
      
      if (expiryDate > currentDate) {
        const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
        return `QR code expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew available after expiry.`;
      }
      
      return 'Renew expired QR code';
    } catch (error) {
      return 'Error checking QR code status';
    }
  };

  const qrCodes = useQRCode(devices, student ? {
    studentId: student.id,
    name: student.name
  } : {});

  const bgClass = darkMode 
    ? 'bg-black text-white' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900';

  const cardBg = darkMode
    ? 'bg-white/5 border border-white/10 backdrop-blur-xl'
    : 'bg-white/80 border border-white/60 backdrop-blur-xl';

  const hoverCardBg = darkMode
    ? 'hover:bg-white/10'
    : 'hover:bg-white/90';

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-500' : 'text-gray-500';

  const getStatusColor = (status) => {
    if (status === 'active') return darkMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-emerald-700 bg-emerald-100';
    if (status === 'pending') return darkMode ? 'text-yellow-400 bg-yellow-500/20' : 'text-yellow-700 bg-yellow-100';
    if (status === 'expired') return darkMode ? 'text-red-400 bg-red-500/20' : 'text-red-700 bg-red-100';
    if (status === 'rejected') return darkMode ? 'text-red-400 bg-red-500/20' : 'text-red-700 bg-red-100';
    if (status === 'deleted') return darkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-700 bg-gray-100';
    return darkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-700 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    if (status === 'active') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    if (status === 'expired') return <XCircle className="w-4 h-4" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4" />;
    if (status === 'deleted') return <Trash2 className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  // Tutorial handlers
  const handleTutorialNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTutorialPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteTutorial = () => {
    setTutorialCompleted(true);
    localStorage.setItem('tutorial_completed', 'true');
  };

  const handleShowTutorial = () => {
    setCurrentStep(0);
    setShowTutorial(true);
  };

  // Render help button in navigation
  const renderHelpButton = () => (
    <button
      onClick={handleShowTutorial}
      className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
        darkMode ? 'hover:bg-white/10 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
      }`}
      title="Show tutorial"
      data-tutorial="help-button"
    >
      <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );

  // Debug: Log notification state
  useEffect(() => {
    if (notification) {
      console.log('🔔 Notification state changed:', notification);
    }
  }, [notification]);

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      {/* Notification */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => {
            console.log('🔔 Closing notification');
            // Notification key is already saved in shownNotifications when notification was triggered
            // Just clear the notification state - it won't show again because the key is already marked as shown
            setNotification(null);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-10 w-80 h-80 ${darkMode ? 'bg-blue-600/20' : 'bg-blue-200/30'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-20 w-96 h-96 ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-200/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      {/* Top Navigation */}
      <nav className={`sticky top-0 z-40 ${cardBg} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                DevPass
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Help button */}
              {/* {renderHelpButton()} */}
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                )}
              </button>
              <button 
                className={`hidden sm:block p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                onClick={() => setShowSettings(true)}
                data-tutorial="settings-button"
              >
                <Settings className={`w-5 h-5 ${textSecondary}`} />
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'hover:bg-white/10 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8" data-tutorial="welcome">
          {loading ? (
            <div className="animate-pulse">
              <div className={`h-8 bg-gray-700 rounded w-64 mb-2`}></div>
              <div className={`h-4 bg-gray-700 rounded w-96`}></div>
            </div>
          ) : (
            <>
              <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2`}>
                Welcome back, {student?.name ? student.name.split(' ')[0] : 'Student'}! 
              </h2>
              <p className={`text-sm sm:text-base ${textSecondary}`}>
                Manage your registered devices and track your campus entries
              </p>
            </>
          )}
        </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Laptop className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>
              {devices.filter(d => d.status === 'active' || d.status === 'pending').length}
            </h3>
            <p className={`text-xs sm:text-sm ${textSecondary}`}>Total Devices</p>
          </div>

          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <CheckCircle className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>{devices.filter(d => d.status === 'active').length}</h3>
            <p className={`text-xs sm:text-sm ${textSecondary}`}>Active Devices</p>
          </div>

          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                <Clock className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`} />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>{devices.filter(d => d.status === 'pending').length}</h3>
            <p className={`text-xs sm:text-sm ${textSecondary}`}>Pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
            data-tutorial="devices-tab"
          >
            My Devices
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
            data-tutorial="activity-tab"
          >
            Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
          >
            Device History
          </button>
          {/* Add Device Button */}
          <div className="ml-auto">
            <button
              onClick={() => setShowRegister(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 cursor-pointer sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              data-tutorial="register-button"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Register New Device
            </button>
          </div>   
        </div>

        {/* Device Filter - only show in devices tab */}
        {activeTab === 'devices' && (
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto">
            <button
              onClick={() => setDeviceFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap border ${darkMode ? 'border-gray-800' : 'border-gray-300'}  cursor-pointer ${
                deviceFilter === 'all'
                  ? darkMode
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              All Devices
            </button>
            <button
              onClick={() => setDeviceFilter('active')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap border ${darkMode ? 'border-gray-800' : 'border-gray-300'} cursor-pointer ${
                deviceFilter === 'active'
                  ? darkMode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setDeviceFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap border ${darkMode ? 'border-gray-800' : 'border-gray-300'} cursor-pointer ${
                deviceFilter === 'pending'
                  ? darkMode
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              Pending
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'devices' ? (
          <div>
            {loadingDevices && <LoadingModal darkMode={darkMode} message="Loading devices..." />}
            {/* Devices List */}
            {!loadingDevices && devices.length === 0 ? (
              <div className={`${cardBg} rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center`}>
                <Laptop className={`w-16 h-16 mx-auto mb-4 ${textMuted}`} />
                <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-2`}>No devices registered</h3>
                <p className={`${textSecondary}`}>Register your first device to get started</p>
              </div>
            ) : (
              (() => {
                // Include devices with pending changes in active filter (they show as active with warning)
                const filteredDevices = devices.filter(device => {
                  if (deviceFilter === 'all') {
                    // Show all devices including rejected and deleted (they may have scan history)
                    return true;
                  }
                  if (deviceFilter === 'active') {
                    // Show active devices AND devices with pending changes (edited devices)
                    return device.status === 'active' || (device.status === 'pending' && device.hasPendingChanges);
                  }
                  if (deviceFilter === 'pending') {
                    // Show only new pending devices (not edited ones)
                    return device.status === 'pending' && !device.hasPendingChanges;
                  }
                  return device.status === deviceFilter;
                });
                const activeDevices = filteredDevices.filter(device => device.status === 'active' || (device.status === 'pending' && device.hasPendingChanges));
                const pendingDevices = filteredDevices.filter(device => device.status === 'pending' && !device.hasPendingChanges);
                const hasActive = activeDevices.length > 0;
                const hasPending = pendingDevices.length > 0;

                // If no active or pending devices after filtering, show empty state
                if (!hasActive && !hasPending) {
                  return (
                    <div className={`${cardBg} rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center`}>
                      <Laptop className={`w-16 h-16 mx-auto mb-4 ${textMuted}`} />
                      <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-2`}>No devices found</h3>
                      <p className={`${textSecondary}`}>Try adjusting your filter</p>
                    </div>
                  );
                }

                // Use 2-column layout for "all" and "active" filters, full width for "pending"
                const useTwoColumn = deviceFilter === 'all' || deviceFilter === 'active';
                const showActive = useTwoColumn || deviceFilter === 'active';
                const showPending = useTwoColumn || deviceFilter === 'pending';
                
                // For "active" filter, split active devices into two groups for left and right columns
                const activeDevicesLeft = deviceFilter === 'active' && activeDevices.length > 0 
                  ? activeDevices.slice(0, Math.ceil(activeDevices.length / 2))
                  : activeDevices;
                const activeDevicesRight = deviceFilter === 'active' && activeDevices.length > 0
                  ? activeDevices.slice(Math.ceil(activeDevices.length / 2))
                  : [];
                
                // Determine container class based on filter
                let containerClass = "";
                if (useTwoColumn) {
                  containerClass = "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6";
                } else if (deviceFilter === 'pending') {
                  containerClass = "space-y-4 sm:space-y-6"; // Full width like admin
                } else {
                  containerClass = "max-w-2xl mx-auto space-y-4 sm:space-y-6";
                }
                
                return (
                  <div className={containerClass}>
                    {/* Active Devices - Left Column (or all if not 2-column) */}
                    {showActive && (
                      <div className="space-y-4 sm:space-y-6">
                        {hasActive ? activeDevicesLeft.map((device) => {
                          const hasPendingChanges = device.hasPendingChanges || false;
                          const borderClass = hasPendingChanges 
                            ? (darkMode ? 'border-2 border-yellow-500/50' : 'border-2 border-yellow-500')
                            : '';
                          
                          return (
                <div key={device.id} className={`${cardBg} ${borderClass} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex-shrink-0`}>
                        <Laptop className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-base sm:text-lg font-bold ${textPrimary} truncate`}>
                          {device.brand} {device.model}
                        </h3>
                        <p className={`text-xs sm:text-sm ${textSecondary}`}>{device.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="hidden sm:inline">{device.status.charAt(0).toUpperCase() + device.status.slice(1)}</span>
                    </span>
                  </div>

                      {/* QR Code Section - Hide if device has pending changes */}
                      {!hasPendingChanges && (
                      <div 
                        className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl border border-blue-500/20"
                        data-tutorial="qrcode-section"
                      >
                        <div className="flex items-center justify-center mb-2 sm:mb-3">
                          {qrCodes[device.id] ? (
                            <img 
                              src={qrCodes[device.id]} 
                              alt={`QR Code for ${device.brand} ${device.model}`}
                              className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg sm:rounded-xl p-2"
                            />
                          ) : (
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg sm:rounded-xl p-2 flex items-center justify-center">
                              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className={`text-xs text-center ${textMuted}`}>
                          Scan this QR code at campus gates
                        </p>
                      </div>
                      )}

                      {!hasPendingChanges && (
                      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm ${textSecondary}`}>QR Expires:</span>
                          <span className={`text-xs sm:text-sm font-semibold ${textPrimary}`}>{device.qrExpiry}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm ${textSecondary}`}>Last Scanned:</span>
                                  <span className={`text-xs sm:text-sm font-semibold ${device.lastScanned ? textPrimary : textMuted}`}>
                                    {device.lastScanned || 'Never'}
                                  </span>
                        </div>
                      </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button 
                              disabled={isRenewDisabled(device) || device.status !== 'active' || hasPendingChanges}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isRenewDisabled(device) && device.status === 'active') {
                                  handleRenewQR(device);
                                }
                              }}
                              title={getRenewTooltip(device)}
                              className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                isRenewDisabled(device) || device.status !== 'active'
                                  ? 'opacity-50 cursor-not-allowed bg-gray-400/20 text-gray-400'
                                  : darkMode 
                                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 cursor-pointer' 
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer'
                              }`}
                              data-tutorial="renew-button"
                            >
                              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Renew
                            </button>
                            {/* Edit button */}
                            {(device.status === 'active' || hasPendingChanges) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDevice(device);
                                }}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                              >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            )}
                            
                            {/* Delete button */}
                            {device.status === 'active' && !hasPendingChanges && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDevice(device);
                                }}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            )}
                            
                          </div>
                          
                          {/* Pending Changes Message */}
                          {hasPendingChanges && (
                            <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                              <div className="flex items-start gap-2 sm:gap-3">
                                <Clock className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                                <div>
                                  <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-1`}>
                                    Waiting for Admin Approval
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-yellow-400/80' : 'text-yellow-700'}`}>
                                    Your device changes are pending admin approval. The device will be reactivated once approved.
                                  </p>
                            </div>
                              </div>
                            </div>
                          )}
                            </div>
                          );
                        }) : null}
                      </div>
                    )}

                    {/* Active Devices - Right Column (only for "active" filter) */}
                    {deviceFilter === 'active' && activeDevicesRight.length > 0 && (
                      <div className="space-y-4 sm:space-y-6">
                        {activeDevicesRight.map((device) => {
                          const hasPendingChanges = device.hasPendingChanges || false;
                          const borderClass = hasPendingChanges 
                            ? (darkMode ? 'border-2 border-yellow-500/50' : 'border-2 border-yellow-500')
                            : '';
                          
                          return (
                <div key={device.id} className={`${cardBg} ${borderClass} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex-shrink-0`}>
                        <Laptop className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-base sm:text-lg font-bold ${textPrimary} truncate`}>
                          {device.brand} {device.model}
                        </h3>
                        <p className={`text-xs sm:text-sm ${textSecondary}`}>{device.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="hidden sm:inline">{device.status.charAt(0).toUpperCase() + device.status.slice(1)}</span>
                    </span>
                  </div>

                      {/* QR Code Section - Hide if device has pending changes */}
                      {!hasPendingChanges && (
                      <div 
                        className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl border border-blue-500/20"
                        data-tutorial="qrcode-section"
                      >
                        <div className="flex items-center justify-center mb-2 sm:mb-3">
                          {qrCodes[device.id] ? (
                            <img 
                              src={qrCodes[device.id]} 
                              alt={`QR Code for ${device.brand} ${device.model}`}
                              className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg sm:rounded-xl p-2"
                            />
                          ) : (
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg sm:rounded-xl p-2 flex items-center justify-center">
                              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className={`text-xs text-center ${textMuted}`}>
                          Scan this QR code at campus gates
                        </p>
                      </div>
                      )}

                      {!hasPendingChanges && (
                      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm ${textSecondary}`}>QR Expires:</span>
                          <span className={`text-xs sm:text-sm font-semibold ${textPrimary}`}>{device.qrExpiry}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm ${textSecondary}`}>Last Scanned:</span>
                                <span className={`text-xs sm:text-sm font-semibold ${device.lastScanned ? textPrimary : textMuted}`}>
                                  {device.lastScanned || 'Never'}
                                </span>
                        </div>
                      </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button 
                            disabled={isRenewDisabled(device) || device.status !== 'active' || hasPendingChanges}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isRenewDisabled(device) && device.status === 'active') {
                                handleRenewQR(device);
                              }
                            }}
                            title={getRenewTooltip(device)}
                            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                              isRenewDisabled(device) || device.status !== 'active'
                                ? 'opacity-50 cursor-not-allowed bg-gray-400/20 text-gray-400'
                                : darkMode 
                                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 cursor-pointer' 
                                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer'
                            }`}
                            data-tutorial="renew-button"
                          >
                            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Renew
                          </button>
                          {/* Edit button */}
                          {(device.status === 'active' || hasPendingChanges) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDevice(device);
                              }}
                              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                            >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                          )}
                          
                          {/* Delete button */}
                          {device.status === 'active' && !hasPendingChanges && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDevice(device);
                              }}
                              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                     
                        </div>
                        
                        {/* Pending Changes Message */}
                        {hasPendingChanges && (
                          <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                            <div className="flex items-start gap-2 sm:gap-3">
                              <Clock className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                              <div>
                                <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-1`}>
                                  Waiting for Admin Approval
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-yellow-400/80' : 'text-yellow-700'}`}>
                                  Your device changes are pending admin approval. The device will be reactivated once approved.
                                </p>
                          </div>
                            </div>
                          </div>
                        )}
                          </div>
                        );
                        })}
                      </div>
                    )}

                    {/* Pending Devices - Show in right column for "all", centered for "pending" */}
                    {showPending && deviceFilter !== 'active' && (
                      <div className="space-y-4 sm:space-y-6">
                        {hasPending ? pendingDevices.map((device) => (
                            <div key={device.id} className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
                              <div className="flex items-start justify-between mb-4 gap-2">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex-shrink-0`}>
                                    <Laptop className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className={`text-base sm:text-lg font-bold ${textPrimary} truncate`}>
                                      {device.brand} {device.model}
                                    </h3>
                                    <p className={`text-xs sm:text-sm ${textSecondary}`}>{device.type}</p>
                                  </div>
                                </div>
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${getStatusColor(device.status)}`}>
                                  {getStatusIcon(device.status)}
                                  <span className="hidden sm:inline">{device.status.charAt(0).toUpperCase() + device.status.slice(1)}</span>
                                </span>
                              </div>

                    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className={`text-xs sm:text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} flex items-center gap-2`}>
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        Waiting for admin approval
                      </p>
                    </div>
                </div>
                          )) : null}
              </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        ) : null}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            {loadingActivity && <LoadingModal darkMode={darkMode} message="Loading activity..." />}
            <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 sm:mb-6`}>Entry History</h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                <p className={`${textSecondary}`}>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity, index) => {
                  const isApproved = activity.status === 'success' || activity.accessStatus === 'approved';
                  const isDenied = activity.status === 'failed' || activity.accessStatus === 'denied';
                  
                  return (
                <div 
                  key={activity.id || index} 
                  onClick={() => setSelectedActivity(activity)}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all cursor-pointer ${darkMode ? 'hover:bg-white/5' : 'hover:bg-white/60'}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
                          isApproved 
                            ? (darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100')
                            : isDenied
                            ? (darkMode ? 'bg-red-500/20' : 'bg-red-100')
                            : (darkMode ? 'bg-gray-500/20' : 'bg-gray-100')
                        }`}>
                          {isApproved ? (
                      <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          ) : isDenied ? (
                            <XCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                          ) : (
                            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          )}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-semibold text-sm sm:text-base ${textPrimary} truncate`}>{activity.gate}</h4>
                          <p className={`text-xs sm:text-sm ${textSecondary}`}>
                            {activity.time}
                            {isApproved && (
                              <span className={`ml-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>• Approved</span>
                            )}
                            {isDenied && (
                              <span className={`ml-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>• Denied</span>
                            )}
                          </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${textMuted} flex-shrink-0`} />
                </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Device History Tab */}
        {activeTab === 'history' && (
          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            {loadingHistory && <LoadingModal darkMode={darkMode} message="Loading history..." />}
            <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 sm:mb-6 flex items-center gap-2`}>
              <Clock className="w-5 h-5" />
              Device History
            </h3>
            {!loadingHistory && deviceHistory.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                <p className={`${textSecondary}`}>No device history available</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {deviceHistory.map((item, index) => {
                  const getActionIcon = () => {
                    if (item.action === 'approved' || item.action === 'changes_approved') {
                      return <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />;
                    } else if (item.action === 'rejected' || item.action === 'reverted') {
                      return <XCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />;
                    } else if (item.action === 'deleted') {
                      return <Trash2 className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />;
                    } else if (item.action === 'renewal_requested' || item.action === 'renewed') {
                      return <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />;
                    }
                    return <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />;
                  };

                  const getActionColor = () => {
                    if (item.action === 'approved' || item.action === 'changes_approved') {
                      return darkMode ? 'bg-emerald-500/10 border-emerald-500' : 'bg-emerald-50 border-emerald-500';
                    } else if (item.action === 'rejected' || item.action === 'reverted' || item.action === 'deleted') {
                      return darkMode ? 'bg-red-500/10 border-red-500' : 'bg-red-50 border-red-500';
                    } else if (item.action === 'renewal_requested' || item.action === 'renewed') {
                      return darkMode ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-500';
                    }
                    return darkMode ? 'bg-yellow-500/10 border-yellow-500' : 'bg-yellow-50 border-yellow-500';
                  };

                  const getIconBgColor = () => {
                    if (item.action === 'approved' || item.action === 'changes_approved') {
                      return darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50';
                    } else if (item.action === 'rejected' || item.action === 'reverted' || item.action === 'deleted') {
                      return darkMode ? 'bg-red-500/10' : 'bg-red-50';
                    } else if (item.action === 'renewal_requested' || item.action === 'renewed') {
                      return darkMode ? 'bg-blue-500/10' : 'bg-blue-50';
                    }
                    return darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50';
                  };

                  const getActionText = () => {
                    if (item.action === 'approved') return 'Approved';
                    if (item.action === 'changes_approved') return 'Changes Approved';
                    if (item.action === 'rejected') return 'Rejected';
                    if (item.action === 'reverted') return 'Changes Reverted';
                    if (item.action === 'deleted') return 'Deleted';
                    if (item.action === 'renewal_requested') return 'Renewal Requested';
                    if (item.action === 'renewed') return 'Renewed';
                    return 'Registered';
                  };

                  return (
                    <div 
                      key={item.id || index}
                      className={`p-4 sm:p-5 rounded-lg sm:rounded-xl border transition-all ${getActionColor()}`}
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`p-2.5 sm:p-3 rounded-full flex-shrink-0 ${getIconBgColor()}`}>
                            {getActionIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm sm:text-base ${textPrimary} mb-1 truncate`}>
                              {item.deviceName || 'Unknown Device'}
                            </h4>
                            <p className={`text-xs sm:text-sm ${textSecondary} mb-1`}>
                              {getActionText()}
                              {item.adminName && ` by ${item.adminName}`}
                            </p>
                            <p className={`text-xs ${textMuted}`}>
                              {item.actionDateFormatted || item.actionDate || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap ${
                          item.status === 'active'
                            ? darkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : item.status === 'rejected' || item.status === 'deleted'
                            ? darkMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'
                            : darkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegister && (
        <Register 
          darkMode={darkMode} 
          onClose={() => setShowRegister(false)}
          onSuccess={async () => {
            // Refresh all data after successful registration
            await refreshDashboardData(true);
          }}
        />
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedActivity(null)}>
          <div 
            className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-md shadow-2xl border max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Scan Details</h2>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                {(() => {
                  const isApproved = selectedActivity.status === 'success' || selectedActivity.accessStatus === 'approved';
                  const isDenied = selectedActivity.status === 'failed' || selectedActivity.accessStatus === 'denied';
                  
                  return (
                    <div className={`p-4 rounded-xl ${
                      isApproved
                        ? (darkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200')
                        : isDenied
                        ? (darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200')
                        : (darkMode ? 'bg-gray-500/20 border border-gray-500/30' : 'bg-gray-50 border border-gray-200')
                    }`}>
                  <div className="flex items-center gap-3">
                        {isApproved ? (
                    <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        ) : isDenied ? (
                          <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        ) : (
                          <Clock className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                    <div>
                          <p className={`text-sm font-semibold ${
                            isApproved
                              ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                              : isDenied
                              ? (darkMode ? 'text-red-400' : 'text-red-700')
                              : (darkMode ? 'text-gray-400' : 'text-gray-700')
                          }`}>
                            {isApproved ? 'Access Granted' : isDenied ? 'Access Denied' : 'Pending'}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            {isApproved ? 'Successfully scanned at gate' : isDenied ? 'Access was denied by security' : 'Status unknown'}
                          </p>
                    </div>
                  </div>
                </div>
                  );
                })()}

                {/* Gate Information */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <MapPin className="w-5 h-5" />
                    Gate Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${textSecondary}`}>Gate Name:</span>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.gate}</span>
                    </div>
                    {selectedActivity.gateLocation && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Location:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.gateLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Information */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Laptop className="w-5 h-5" />
                    Device Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${textSecondary}`}>Device:</span>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.device}</span>
                    </div>
                    {selectedActivity.deviceType && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Type:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.deviceType}</span>
                      </div>
                    )}
                    {selectedActivity.deviceSerial && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Serial Number:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.deviceSerial}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Information */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Clock className="w-5 h-5" />
                    Scan Time
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${textSecondary}`}>Date & Time:</span>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.fullTimestamp || selectedActivity.time}</span>
                    </div>
                  </div>
                </div>

                {/* Security Guard */}
                {selectedActivity.securityGuard && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <Shield className="w-5 h-5" />
                      Security Personnel
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Guard Name:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.securityGuard}</span>
                      </div>
                      {selectedActivity.securityGuardId && (
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>Guard ID:</span>
                          <span className={`text-sm font-semibold ${textPrimary}`}>{selectedActivity.securityGuardId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedActivity(null)}
                className="w-full mt-6 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-md shadow-2xl border`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <LogOut className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary}`}>Confirm Logout</h2>
                  <p className={`text-sm ${textSecondary}`}>Are you sure you want to log out?</p>
                </div>
              </div>
              
              <p className={`text-sm mb-6 ${textSecondary}`}>
                You will need to log in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Clear storage synchronously first (before closing modal)
                    localStorage.removeItem('token');
                    localStorage.removeItem('student');
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('tutorial_completed'); // Also clear tutorial completion
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('student');
                    // Close modal
                    setShowLogoutConfirm(false);
                    // Navigate to landing page immediately - this will cause full page reload
                    window.location.replace('/');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <StudentSettingsModal 
          darkMode={darkMode} 
          onClose={() => setShowSettings(false)}
          studentData={student || {}}
          onUpdate={(updatedStudent) => {
            setStudent(updatedStudent);
            // Update storage
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('student', JSON.stringify(updatedStudent));
          }}
        />
      )}

      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <DeviceEditModal
          darkMode={darkMode}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
          }}
          device={selectedDevice}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Renew QR Code Modal */}
      {showRenewModal && deviceToRenew && (
        <DeviceRenewModal
          darkMode={darkMode}
          onClose={() => {
            setShowRenewModal(false);
            setDeviceToRenew(null);
          }}
          device={deviceToRenew}
          onSuccess={handleRenewSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deviceToDelete && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4`}>
          <div className={`${darkMode ? 'bg-black border border-white/10 backdrop-blur-xl' : 'bg-white border border-gray-200 backdrop-blur-xl'} rounded-xl sm:rounded-2xl w-full max-w-md sm:max-w-lg h-auto flex flex-col relative z-10`}>
            {/* Header */}
            <div className="border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg sm:rounded-xl shadow-lg">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete Device</h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirm device deletion</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeviceToDelete(null);
                }}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6">
              <div className={`${darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-4 sm:p-6 mb-4`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <div className="flex-1">
                    <h3 className={`text-base sm:text-lg font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                      Warning: This action cannot be undone
                    </h3>
                    <p className={`text-sm sm:text-base ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                      Are you sure you want to delete <span className="font-semibold">{deviceToDelete.brand} {deviceToDelete.model}</span>? 
                      This will permanently remove the device and all associated QR codes from your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-4`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-semibold">Device Details:</span>
                </p>
                <div className="mt-2 space-y-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">Brand:</span> {deviceToDelete.brand || 'N/A'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">Model:</span> {deviceToDelete.model}
                  </p>
                  {deviceToDelete.serialNumber && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Serial Number:</span> {deviceToDelete.serialNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeviceToDelete(null);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteDevice}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Device</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Guide */}
      {/* {showTutorial && (
        <TutorialGuide
          darkMode={darkMode}
          onClose={() => setShowTutorial(false)}
          currentStep={currentStep}
          onNext={handleTutorialNext}
          onPrev={handleTutorialPrev}
          onComplete={handleCompleteTutorial}
        />
      )} */}
    </div>
  );
}