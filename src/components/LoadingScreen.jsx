import PropTypes from 'prop-types';
import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ progress = 0, status = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),rgba(15,23,42,0))]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* Music note animation */}
        <motion.div
          className="mb-8"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg 
            className="w-16 h-16 text-blue-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
            />
          </svg>
        </motion.div>

        {/* Loading text */}
        <motion.h2
          className="text-3xl font-serif text-blue-200 mb-4"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {status}
        </motion.h2>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-blue-900/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
        
        {/* Progress percentage */}
        <motion.p 
          className="mt-2 text-sm text-blue-200/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(progress)}%
        </motion.p>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  progress: PropTypes.number,
  status: PropTypes.string,
};

export default LoadingScreen;
