// Notification.jsx
import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notification({ notification, onClose, darkMode = true }) {
  if (!notification) return null;

  const { type, message, title } = notification;

  // Enhanced styling with better dark mode support
  const bgColor = {
    success: darkMode 
      ? 'bg-emerald-500/20 border-emerald-500/50 backdrop-blur-xl' 
      : 'bg-emerald-50 border-emerald-200 backdrop-blur-xl',
    error: darkMode 
      ? 'bg-red-500/20 border-red-500/50 backdrop-blur-xl' 
      : 'bg-red-50 border-red-200 backdrop-blur-xl',
    warning: darkMode 
      ? 'bg-yellow-500/20 border-yellow-500/50 backdrop-blur-xl' 
      : 'bg-yellow-50 border-yellow-200 backdrop-blur-xl',
    info: darkMode 
      ? 'bg-blue-500/20 border-blue-500/50 backdrop-blur-xl' 
      : 'bg-blue-50 border-blue-200 backdrop-blur-xl',
  };

  const textColor = {
    success: darkMode ? 'text-emerald-400' : 'text-emerald-700',
    error: darkMode ? 'text-red-400' : 'text-red-700',
    warning: darkMode ? 'text-yellow-400' : 'text-yellow-700',
    info: darkMode ? 'text-blue-400' : 'text-blue-700',
  };

  const iconColor = {
    success: darkMode ? 'text-emerald-400' : 'text-emerald-600',
    error: darkMode ? 'text-red-400' : 'text-red-600',
    warning: darkMode ? 'text-yellow-400' : 'text-yellow-600',
    info: darkMode ? 'text-blue-400' : 'text-blue-600',
  };

  const messageTextColor = darkMode ? 'text-white/90' : 'text-gray-800';

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  // Auto-close after 5 seconds
  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 100, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-20 right-4 sm:right-6 z-[9999]"
      >
        <div
          className={`
            ${bgColor[type] || bgColor.info}
            border-2 rounded-xl p-4 shadow-2xl
            min-w-[320px] max-w-[420px]
            flex items-start gap-3
            ${darkMode ? 'bg-black/80' : 'bg-white/95'}
          `}
        >
          <div className={`flex-shrink-0 ${iconColor[type] || iconColor.info} mt-0.5`}>
            {icons[type] || icons.info}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-semibold text-sm mb-1.5 ${textColor[type] || textColor.info}`}>
                {title}
              </h4>
            )}
            <p className={`text-sm leading-relaxed ${messageTextColor}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 transition-colors p-1 rounded-lg ${
              darkMode 
                ? 'text-white/60 hover:text-white hover:bg-white/10' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

