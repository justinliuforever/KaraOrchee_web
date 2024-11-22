import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import config from '../config';

const VerifySubscriptionPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('initial');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (status === 'initial' && !verificationAttempted.current) {
      verificationAttempted.current = true;
      handleVerification();
    }
  }, []);

  const handleVerification = async () => {
    setStatus('verifying');
    try {
      const response = await axios.get(`${config.subscriptionUrl}verify/${token}`);
      setStatus('success');
      setMessage(response.data.message);
      setError(null);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      setStatus('error');
      setError(err);
      if (err.response?.data?.alreadyVerified) {
        setMessage(`This subscription was already verified on ${new Date(err.response.data.verifiedAt).toLocaleDateString()}`);
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else {
        setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4 }
    }
  };

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        {status === 'verifying' && (
          <motion.div
            key="verifying"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute inset-0 border-4 border-indigo-200 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 border-4 border-t-indigo-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.span 
              className="text-lg text-gray-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Verifying your subscription...
            </motion.span>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="text-center space-y-4"
          >
            <motion.div 
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Subscription Verified!
            </motion.h3>
            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.p>
            <motion.p 
              className="text-sm text-gray-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Redirecting you to the home page in 5 seconds...
            </motion.p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="text-center space-y-4"
          >
            <motion.div 
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {error?.response?.data?.alreadyVerified ? 'Already Verified' : 'Verification Failed'}
            </motion.h3>
            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.p>
            <motion.div 
              className="flex flex-col space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {!error?.response?.data?.alreadyVerified && (
                <button
                  onClick={handleVerification}
                  className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors duration-200"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-md bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Return to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          className="bg-white py-12 px-8 shadow-xl rounded-xl sm:px-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default VerifySubscriptionPage;
