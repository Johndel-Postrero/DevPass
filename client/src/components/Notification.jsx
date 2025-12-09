// Notification.jsx
import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notification({ notification, onClose }) {
  if (!notification) return null;

  const { type, message, title } = notification;

  const bgColor = {
    success: 'bg-emerald-500/20 border-emerald-500/50',
    error: 'bg-red-500/20 border-red-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
    info: 'bg-blue-500/20 border-blue-500/50',
  };

  const textColor = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const iconColor = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

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
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        className="fixed top-4 left-1/2 z-[9999] transform"
      >
        <div
          className={`
            ${bgColor[type] || bgColor.info}
            border-2 rounded-xl p-4 shadow-2xl backdrop-blur-xl
            min-w-[300px] max-w-[500px]
            flex items-start gap-3
          `}
        >
          <div className={`flex-shrink-0 ${iconColor[type] || iconColor.info}`}>
            {icons[type] || icons.info}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-semibold text-sm mb-1 ${textColor[type] || textColor.info}`}>
                {title}
              </h4>
            )}
            <p className="text-sm text-white/90">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

