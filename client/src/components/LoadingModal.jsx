// LoadingModal.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingModal({ darkMode, message = 'Loading...' }) {
  const bgClass = darkMode 
    ? 'bg-black/50 backdrop-blur-sm' 
    : 'bg-black/50 backdrop-blur-sm';

  const cardBg = darkMode
    ? 'bg-black border border-white/10 backdrop-blur-xl'
    : 'bg-white border border-gray-200 backdrop-blur-xl';

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`fixed inset-0 ${bgClass} z-[9998] flex items-center justify-center p-3 sm:p-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${cardBg} rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 min-w-[200px]`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </motion.div>
        <p className={`text-sm sm:text-base font-medium ${textPrimary}`}>{message}</p>
      </motion.div>
    </div>
  );
}

