import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, EnvelopeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import axios from 'axios';
import config from '../../config'; // Adjust the path as necessary

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${config.subscriptionUrl}subscribe`, { email });
      setStatus('success');
      setMessage(response.data.message);
      setEmail(''); // Clear input on success
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const renderStatusMessage = () => {
    return (
      <AnimatePresence mode="wait">
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {status === 'loading' && (
              <div className="flex items-center justify-center space-x-2 text-indigo-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <span className="text-sm font-medium">Sending verification email...</span>
              </div>
            )}
            
            {status === 'success' && (
              <div className="bg-green-50 rounded-lg p-4 flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Subscription Initiated!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>We've sent a verification link to your email address.</p>
                    <p className="mt-1">Please check your inbox and click the link to complete your subscription.</p>
                  </div>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="bg-red-50 rounded-lg p-4 flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Subscription Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error.includes('wait 5 minutes') ? (
                      <>
                        <p>Please wait a moment before requesting another verification email.</p>
                        <p className="mt-1">This helps us prevent spam and ensure delivery reliability.</p>
                      </>
                    ) : error.includes('already subscribed') ? (
                      <p>This email is already subscribed to our newsletter.</p>
                    ) : (
                      <p>{error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Stay Tuned for Our Classical Music Updates
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
          Subscribe to receive the latest news on our classical music offerings, including new releases and exclusive content.
        </p>
        
        <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-md gap-x-4">
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <div className="relative flex-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 bg-white/5 pl-10 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
              placeholder="Enter your email"
              disabled={status === 'loading'}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`flex-none rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm 
              ${status === 'loading' 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-white hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
              }`}
          >
            Subscribe
          </button>
        </form>

        {renderStatusMessage()}

        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
          aria-hidden="true"
        >
          <circle cx={512} cy={512} r={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
          <defs>
            <radialGradient
              id="759c1415-0410-454c-8f7c-9a820de03641"
              cx={0}
              cy={0}
              r={1}
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(512 512) rotate(90) scale(512)"
            >
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Newsletter;
