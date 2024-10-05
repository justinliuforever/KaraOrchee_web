import React, { useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import useHeadPoseDetection from '../hooks/useHeadPoseDetection';

const HeadPoseControl = ({ onUnlock, onPlay, isPlaying }) => {
  const { videoRef, canvasRef, status, pitch } = useHeadPoseDetection();
  const [isUnlocked, setIsUnlocked] = React.useState(false);

  const y = useMotionValue(0);
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });
  const scale = useTransform(ySpring, [-150, 0, 150], [0.8, 1, 1.2]);
  const background = useTransform(
    ySpring,
    [-150, 0, 150],
    ["#ff008c", "#7700ff", "rgb(230, 255, 0)"]
  );

  const unlockProgress = useTransform(
    ySpring,
    [-75, -15],
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
      if (pitch >= 20 && !isUnlocked) {
        setIsUnlocked(true);
        onUnlock();
      } else if (pitch < 15 && isUnlocked && !isPlaying) {
        onPlay();
      }
    }
  }, [pitch, isUnlocked, onUnlock, onPlay, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      resetUnlocked();
    }
  }, [isPlaying, resetUnlocked]);

  return (
    <div style={{ position: 'relative', width: 300, height: 300, border: '1px solid black', overflow: 'hidden' }}>
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
          width: 50,
          height: 50,
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
      <p className="mt-4">Status: {status}</p>
      <p>Pitch: {pitch?.toFixed(2)}</p>
      <p>Unlocked: {isUnlocked ? 'Yes' : 'No'}</p>
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

export default HeadPoseControl;
