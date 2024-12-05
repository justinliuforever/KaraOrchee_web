import React, { useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import PropTypes from 'prop-types';
import useHeadPoseDetection from '../hooks/useHeadPoseDetection';

// SETTINGS
// The pitch angle (in degrees) at which the control unlocks
const UNLOCK_THRESHOLD = 20;

// The pitch angle (in degrees) at which playback starts after unlocking
const PLAY_THRESHOLD = 15;

// The range of motion for the visual element (min, neutral, max)
const MOTION_RANGE = [-150, 0, 150];

// The range of pitch values mapped to unlock progress (0% to 100%)
const PROGRESS_RANGE = [-75, -15];

// The color range for the visual feedback (start color, middle color, end color)
const COLOR_RANGE = ["#ff008c", "#7700ff", "rgb(230, 255, 0)"];


const HeadPoseControl = ({ onUnlock, onPlay, isPlaying, onHeadDetectionChange, onClose, startRecording, stopRecording }) => {
  const { videoRef, canvasRef, status, pitch, mediaStream } = useHeadPoseDetection();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [waitingForPlayGesture, setWaitingForPlayGesture] = React.useState(false);

  const y = useMotionValue(0);
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });
  const scale = useTransform(ySpring, MOTION_RANGE, [0.8, 1, 1.2]);
  const background = useTransform(ySpring, MOTION_RANGE, COLOR_RANGE);

  const unlockProgress = useTransform(
    ySpring,
    PROGRESS_RANGE,
    [100, 0]
  );

  const resetUnlocked = useCallback(() => {
    setIsUnlocked(false);
  }, []);

  useEffect(() => {
    if (pitch !== null) {
      y.set(-pitch * 5);

      // Step 1: Check for unlock gesture (head up)
      if (pitch >= UNLOCK_THRESHOLD && !isUnlocked) {
        setIsUnlocked(true);
        setWaitingForPlayGesture(true);
        onUnlock();
      } 
      // Step 2: Check for play gesture (head down) after unlock
      else if (pitch < PLAY_THRESHOLD && isUnlocked && waitingForPlayGesture) {
        setWaitingForPlayGesture(false);
        onPlay();
      }
    }
  }, [pitch, isUnlocked, waitingForPlayGesture, onUnlock, onPlay]);

  // Reset states when not in use
  useEffect(() => {
    if (!isPlaying) {
      setIsUnlocked(false);
      setWaitingForPlayGesture(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    onHeadDetectionChange(status === 'detected');
  }, [status, onHeadDetectionChange]);

  // Start recording when mediaStream is available
  useEffect(() => {
    if (startRecording && mediaStream) {
      startRecording(mediaStream); // Pass mediaStream to startRecording
    }

    return () => {
      if (stopRecording) {
        stopRecording();
      }
    };
  }, [startRecording, stopRecording, mediaStream]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative z-10 bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 backdrop-blur-sm"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">
            Cadenza Control
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use head gestures to control the cadenza section
          </p>
        </div>

        {/* Head pose visualization */}
        <div className="flex justify-center mb-6">
          <div style={{
            position: 'relative',
            width: 100,
            height: 360,
            borderRadius: 50,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
            overflow: 'hidden',
          }}>
            {/* Existing motion elements */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#7700ff',
                opacity: 0.2,
                borderRadius: '0 0 40px 40px',
              }}
              animate={{
                height: unlockProgress.get() + '%',
              }}
            />
            <motion.div
              style={{
                width: 30,
                height: 60,
                borderRadius: 15,
                position: 'absolute',
                left: '50%',
                top: '50%',
                x: '-50%',
                y: ySpring,
                scale,
                background,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              animate={isUnlocked ? { rotate: 360 } : { rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
          </div>
        </div>

        {/* Instructions */}
        <motion.div 
          className="text-center text-sm font-medium text-blue-600 dark:text-blue-400"
          animate={{
            opacity: [0.5, 1, 0.5],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {!isUnlocked ? 'Lift head to begin' : 
           waitingForPlayGesture ? 'Nod to continue' : 
           'Processing...'}
        </motion.div>

        {/* Hidden video elements */}
        <video ref={videoRef} style={{ display: 'none' }} width="640" height="480" />
        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
      </motion.div>
    </motion.div>
  );
};

HeadPoseControl.propTypes = {
  onUnlock: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onHeadDetectionChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  startRecording: PropTypes.func.isRequired,
  stopRecording: PropTypes.func.isRequired,
};

export default HeadPoseControl;
