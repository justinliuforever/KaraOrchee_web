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
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Song information section */}
        <div className="flex items-center space-x-4 mb-4">
          <motion.img 
            src={musicData?.coverImageUrl || "https://via.placeholder.com/48"}
            alt="Album cover" 
            className="w-12 h-12 rounded-lg"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          />
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {musicData?.title || 'Loading...'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {musicData?.composerFullName || 'Unknown Artist'}
            </p>
          </div>
        </div>
        {/* Progress bar section with cadenza markers */}
        <div className="mb-2">
          <div 
            className="bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer relative" 
            onClick={handleSeek}
            style={{ height: '8px' }}
          >
            {renderCadenzaMarkers()}
            <motion.div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          {/* Time display */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        {/* Playback control buttons */}
        <div className="flex justify-center items-center space-x-6">
          {/* Previous track button */}
          <motion.button 
            className={buttonStyles}
            {...buttonAnimations}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          {/* Play/Pause button */}
          <motion.button
            animate={controls}
            onClick={isPlaying ? onPause : onPlay}
            className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            {...buttonAnimations}
          >
            {isPlaying ? (
              // Pause icon
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              // Play icon
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </motion.button>
          {/* Next track button */}
          <motion.button 
            className={buttonStyles}
            {...buttonAnimations}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
