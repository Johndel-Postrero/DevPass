// DeviceRenewModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../../api/axios';
import Notification from '../../components/Notification';

export default function DeviceRenewModal({ darkMode, onClose, device, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const handleRenew = async () => {
    setError('');
    setLoading(true);

    try {
      await api.post(`/devices/${device.id}/renew-qr`);
      
      setNotification({
        type: 'success',
        title: 'Renewal Requested!',
        message: 'Your QR code renewal request has been submitted. Please wait for admin approval.',
        autoClose: true,
      });
      
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after a short delay to allow notification to be seen
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error requesting renewal:', err);
      const errorMessage = err.response?.data?.message || 'Failed to request renewal. Please try again.';
      setError(errorMessage);
      setNotification({
        type: 'error',
        title: 'Renewal Failed',
        message: errorMessage,
        autoClose: true,
      });
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

  if (!device) {
    return null;
  }

  // Get QR expiry date
  const qrExpiry = device.qrExpiry ? new Date(device.qrExpiry) : null;
  const isExpired = qrExpiry ? qrExpiry < new Date() : false;

  return (
    <>
      <div className={`fixed inset-0 ${bgClass} z-50 flex items-center justify-center p-3 sm:p-4`}>
        <div className={`${cardBg} rounded-xl sm:rounded-2xl w-full max-w-md sm:max-w-lg h-auto flex flex-col relative z-10`}>
          {/* Header */}
          <div className="border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold ${textPrimary}`}>Renew QR Code</h2>
                <p className={`text-xs ${textSecondary}`}>Request QR code renewal</p>
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
          <div className="flex-1 p-4 sm:p-6">
            {/* Device Info */}
            <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4`}>
              <h4 className={`text-base sm:text-lg font-bold ${textPrimary} flex items-center gap-2 mb-4`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Device Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <p className={`text-xs ${textSecondary} mb-1`}>Device</p>
                  <p className={`text-sm font-semibold ${textPrimary}`}>
                    {device.brand} {device.model}
                  </p>
                </div>
                {device.serialNumber && (
                  <div>
                    <p className={`text-xs ${textSecondary} mb-1`}>Serial Number</p>
                    <p className={`text-sm ${textPrimary}`}>{device.serialNumber}</p>
                  </div>
                )}
                {qrExpiry && (
                  <div>
                    <p className={`text-xs ${textSecondary} mb-1`}>QR Code Expiry</p>
                    <p className={`text-sm font-semibold ${isExpired ? 'text-red-500' : textPrimary}`}>
                      {qrExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {isExpired && ' (Expired)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Your renewal request will be submitted for admin approval. You will be notified once the renewal is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mt-4 p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <p className="text-sm">{error}</p>
              </div>
            )}
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
                onClick={handleRenew}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Request Renewal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {notification && (
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
          darkMode={darkMode} 
        />
      )}
    </>
  );
}

