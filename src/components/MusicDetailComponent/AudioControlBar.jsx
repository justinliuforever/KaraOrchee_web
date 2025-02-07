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
  musicData,
  timeStringToSeconds,
  isRecordingMode,
  onToggleMode,
  rehearsalPoints,
  onRehearsalPointClick,
  currentRehearsalPoint,
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

  // Render rehearsal markers
  const renderRehearsalMarkers = () => {
    if (!rehearsalPoints?.length) return null;

    return (
      <div className="absolute -top-8 left-0 right-0">
        {rehearsalPoints.map((point, index) => {
          const position = (timeStringToSeconds(point.time) / duration) * 100;
          const isSelected = currentRehearsalPoint?.letter === point.letter;
          
          return (
            <motion.button
              key={index}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${position}%` }}
              onClick={() => onRehearsalPointClick(point)}
              whileHover={{ scale: 1.1 }}
            >
              <div className={`px-2 py-1 rounded-full text-xs ${
                isSelected ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {point.letter}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="bg-gray-900/95 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Simplified progress bar without markers */}
          <div className="relative mb-4">
            <div 
              className="h-2 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Time display */}
            <div className="text-sm text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Central controls */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={isPlaying ? onPause : onPlay}
                className={`p-3 rounded-full ${isPlaying ? 'bg-blue-500' : 'bg-blue-500/30'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isPlaying ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  )}
                </svg>
              </motion.button>
            </div>

            {/* Recording mode toggle */}
            <motion.button
              onClick={onToggleMode}
              className={`px-4 py-2 rounded-full transition-colors ${
                isRecordingMode 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isRecordingMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
                <span>{isRecordingMode ? 'Exit Recording' : 'Record'}</span>
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
  musicData: PropTypes.object,
  timeStringToSeconds: PropTypes.func.isRequired,
  isRecordingMode: PropTypes.bool.isRequired,
  onToggleMode: PropTypes.func.isRequired,
  rehearsalPoints: PropTypes.array,
  onRehearsalPointClick: PropTypes.func.isRequired,
  currentRehearsalPoint: PropTypes.object,
};

export default AudioControlBar;
