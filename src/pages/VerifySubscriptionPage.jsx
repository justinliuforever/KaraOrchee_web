import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import config from '../config';

const VerifySubscriptionPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('initial'); // 'initial' | 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

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

  const renderContent = () => {
    switch (status) {
      case 'initial':
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Verify Your Subscription</h3>
            <p className="mt-2 text-gray-500">Click the button below to complete your subscription verification.</p>
            <button
              onClick={handleVerification}
              className="mt-4 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Verify Subscription
            </button>
          </div>
        );
      case 'verifying':
        return (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3">Verifying your subscription...</span>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">Subscription Verified!</h3>
            <p className="mt-2 text-gray-500">{message}</p>
            <p className="mt-2 text-sm text-gray-500">Redirecting you to the home page in 5 seconds...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">
              {error?.response?.data?.alreadyVerified ? 'Already Verified' : 'Verification Failed'}
            </h3>
            <p className="mt-2 text-gray-500">{message}</p>
            <div className="mt-4 space-y-2">
              {!error?.response?.data?.alreadyVerified && (
                <button
                  onClick={handleVerification}
                  className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-md bg-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/pic/Final-08.png"
          alt="KaraOrchee"
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VerifySubscriptionPage;
