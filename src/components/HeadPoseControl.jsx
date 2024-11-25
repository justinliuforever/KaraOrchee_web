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


const HeadPoseControl = ({ onUnlock, onPlay, isPlaying, onHeadDetectionChange }) => {
  const { videoRef, canvasRef, status, pitch } = useHeadPoseDetection();
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

  return (
    <div style={{
      position: 'relative',
      width: 80,
      height: 300,
      borderRadius: 40,
      backgroundColor: '#f0f0f0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="absolute top-4 left-0 right-0 text-center">
        <span className="text-xs font-medium text-blue-500">
          {!isUnlocked ? 'Lift head to unlock' : 
           waitingForPlayGesture ? 'Nod to skip cadenza' : 
           'Processing...'}
        </span>
      </div>
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
      {/* <p className="mt-4">Status: {status}</p>
      <p>Pitch: {pitch?.toFixed(2)}</p>
      <p>Unlocked: {isUnlocked ? 'Yes' : 'No'}</p>
      <p>Head Detected: {status === 'detected' ? 'Yes' : 'No'}</p> */}
      
      {/* Hidden video and canvas elements required for head pose detection */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      ></video>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      ></canvas>
    </div>
  );
};

HeadPoseControl.propTypes = {
  onUnlock: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onHeadDetectionChange: PropTypes.func.isRequired,
};

export default HeadPoseControl;
