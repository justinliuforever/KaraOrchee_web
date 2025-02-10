import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const AudioControlBar = ({ 
  audioRef, 
  isPlaying, 
  onPlay, 
  onPause, 
  currentTime, 
  duration,
  isRecordingMode,
  onToggleMode,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((currentTime / duration) * 100 || 0);
  }, [currentTime, duration]);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="bg-gray-900/95 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Simplified Progress Bar */}
          <div 
            className="h-2 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden
                     hover:h-3 transition-all duration-200 mb-4"
            onClick={handleSeek}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${progress}%` }}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Controls Section */}
          <div className="flex items-center justify-between">
            {/* Time Display */}
            <div className="text-sm font-mono tracking-wider">
              <span className="text-white/80">{formatTime(currentTime)}</span>
              <span className="text-white/30 mx-2">|</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>

            {/* Play/Pause Button */}
            <motion.button
              onClick={isPlaying ? onPause : onPlay}
              className={`p-4 rounded-full ${
                isPlaying 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg 
                className="w-6 h-6 text-white"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: isPlaying ? 0 : 360 }}
                transition={{ duration: 0.3 }}
              >
                {isPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                )}
              </motion.svg>
            </motion.button>

            {/* Recording Mode Toggle */}
            <motion.button
              onClick={onToggleMode}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${
                isRecordingMode 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/20' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <motion.svg 
                  className="w-4 h-4"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ 
                    scale: isRecordingMode ? [1, 1.2, 1] : 1 
                  }}
                  transition={{ 
                    repeat: isRecordingMode ? Infinity : 0,
                    duration: 1
                  }}
                >
                  {isRecordingMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </motion.svg>
                <span className="font-medium tracking-wide">
                  {isRecordingMode ? 'Exit Recording' : 'Record'}
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

AudioControlBar.propTypes = {
  audioRef: PropTypes.object.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  isRecordingMode: PropTypes.bool.isRequired,
  onToggleMode: PropTypes.func.isRequired,
};

export default AudioControlBar;
