import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

import PropTypes from 'prop-types';

// Common animation variants
const buttonAnimations = {
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

const AudioControlBar = ({ 
  audioRef, 
  isPlaying, 
  onPlay, 
  onPause, 
  currentTime, 
  duration, 
  musicData,
  timeStringToSeconds 
}) => {
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    setProgress((currentTime / duration) * 100 || 0);
  }, [currentTime, duration]);

  useEffect(() => {
    controls.start(isPlaying ? { scale: 1.1 } : { scale: 1 });
  }, [isPlaying, controls]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const seekPercentage = (e.clientX - rect.left) / rect.width;
    const seekTime = seekPercentage * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Common button styles
  const buttonStyles = "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white";

  // Add visualization for cadenza sections in progress bar
  const renderCadenzaMarkers = () => {
    if (!musicData?.cadenzaTimeFrames) return null;

    return musicData.cadenzaTimeFrames.map((cadenza, index) => {
      const startPercent = (timeStringToSeconds(cadenza.beginning) / duration) * 100;
      const endPercent = (timeStringToSeconds(cadenza.ending) / duration) * 100;
      const width = endPercent - startPercent;

      return (
        <motion.div
          key={index}
          className="absolute h-full bg-blue-300 dark:bg-blue-600 opacity-40"
          style={{
            left: `${startPercent}%`,
            width: `${width}%`,
          }}
          whileHover={{ opacity: 0.6 }}
        />
      );
    });
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-gray-900/60 backdrop-blur-xl border-t border-white/5" />

      <div className="relative max-w-7xl mx-auto px-8 py-6">
        {/* Progress bar section */}
        <div className="mb-8">
          <div 
            className="relative h-2.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleSeek}
          >
            {/* Hover track effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Cadenza markers */}
            {renderCadenzaMarkers()}
            
            {/* Progress gradient */}
            <motion.div
              className="absolute h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            
            {/* Progress handle */}
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-glow opacity-0 group-hover:opacity-100"
              style={{ left: `${progress}%`, x: '-50%' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur opacity-50" />
            </motion.div>
          </div>

          {/* Time display */}
          <div className="flex justify-between text-xs text-blue-300/60 mt-3 font-light tracking-wider">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls - Centered */}
        <div className="flex justify-center items-center space-x-12">
          {/* Previous */}
          <motion.button 
            className="text-blue-300/60 hover:text-blue-200 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            onClick={isPlaying ? onPause : onPlay}
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:opacity-75 transition-opacity" />
            <div className="relative p-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400">
              {isPlaying ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </motion.button>

          {/* Next */}
          <motion.button 
            className="text-blue-300/60 hover:text-blue-200 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// PropTypes for type checking
AudioControlBar.propTypes = {
  audioRef: PropTypes.object.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  musicData: PropTypes.object,
  timeStringToSeconds: PropTypes.func.isRequired,
};

export default AudioControlBar;
