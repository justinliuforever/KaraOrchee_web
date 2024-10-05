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
    }
  }, [pitch, y]);

  useEffect(() => {
    if (pitch !== null) {
      if (pitch >= UNLOCK_THRESHOLD && !isUnlocked) {
        setIsUnlocked(true);
        onUnlock();
      } else if (pitch < PLAY_THRESHOLD && isUnlocked && !isPlaying) {
        onPlay();
      }
    }
  }, [pitch, isUnlocked, onUnlock, onPlay, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      resetUnlocked();
    }
  }, [isPlaying, resetUnlocked]);

  useEffect(() => {
    onHeadDetectionChange(status === 'detected');
  }, [status, onHeadDetectionChange]);

  return (
    <div style={{ position: 'relative', width: 60, height: 260, border: '1px solid black', overflow: 'hidden' }}>
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#7700ff',
          opacity: 0.3,
        }}
        animate={{
          height: unlockProgress.get() + '%',
        }}
      />
      <motion.div
        style={{
          width: 20,
          height: 40,
          borderRadius: 10,
          position: 'absolute',
          left: '50%',
          top: '50%',
          x: '-50%',
          y: ySpring,
          scale,
          background,
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
