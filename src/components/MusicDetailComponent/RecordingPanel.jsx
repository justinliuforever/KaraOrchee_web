import { AnimatePresence, motion } from 'framer-motion';

import PropTypes from 'prop-types';
import React from 'react';

// Move PlayPauseIcon component outside
const PlayPauseIcon = ({ isPlaying }) => (
  <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {isPlaying ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    )}
  </svg>
);

PlayPauseIcon.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
};

const RecordingPanel = ({
  isRecording,
  recordedAudio,
  currentTime,
  duration,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onPauseRecording,
  isPlayingRecording,
  recordedSegments,
  rehearsalPoints,
  onRehearsalPointSelect,
  currentRehearsalPoint,
  onClearRecording,
  onRetakeComplete,
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <motion.div 
      className="fixed bottom-24 left-0 right-0 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Recording Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-red-300 font-medium">Recording in progress</span>
                  </div>
                  <span className="text-white/60 font-mono">{formatTime(currentTime)}</span>
                </div>

                {/* Stop Recording Button */}
                <motion.button
                  onClick={onStopRecording}
                  className="w-full py-3 rounded-lg bg-red-500 text-white font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Stop Recording
                </motion.button>
              </motion.div>
            ) : recordedAudio ? (
              <motion.div
                key="playback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={isPlayingRecording ? onPauseRecording : onPlayRecording}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-green-500/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlayPauseIcon isPlaying={isPlayingRecording} />
                    <span className="text-green-300">
                      {isPlayingRecording ? 'Pause' : 'Play'} Recording
                    </span>
                  </motion.button>
                  <span className="text-white/60 font-mono">{formatTime(currentTime)}</span>
                </div>

                {/* Rehearsal Point Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/80">
                    Re-record from a specific point
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {rehearsalPoints?.map((point, index) => (
                      <motion.button
                        key={index}
                        onClick={() => onRehearsalPointSelect(point)}
                        className={`p-2 rounded-lg ${
                          currentRehearsalPoint?.letter === point.letter
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-blue-300 hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-lg font-medium">{point.letter}</div>
                        <div className="text-xs opacity-60">{point.time}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={onStartRecording}
                    className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentRehearsalPoint 
                      ? `Re-record from ${currentRehearsalPoint.letter}` 
                      : 'Start New Recording'
                    }
                  </motion.button>
                  <motion.button
                    onClick={onClearRecording}
                    className="px-6 py-3 rounded-lg bg-red-500/20 text-red-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <motion.button
                  onClick={onStartRecording}
                  className="px-8 py-4 rounded-lg bg-blue-500 text-white font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start New Recording
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

RecordingPanel.propTypes = {
  isRecording: PropTypes.bool.isRequired,
  recordedAudio: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  onStartRecording: PropTypes.func.isRequired,
  onStopRecording: PropTypes.func.isRequired,
  onPlayRecording: PropTypes.func.isRequired,
  onPauseRecording: PropTypes.func.isRequired,
  isPlayingRecording: PropTypes.bool.isRequired,
  recordedSegments: PropTypes.array.isRequired,
  rehearsalPoints: PropTypes.array,
  onRehearsalPointSelect: PropTypes.func.isRequired,
  currentRehearsalPoint: PropTypes.object,
  onClearRecording: PropTypes.func.isRequired,
  onRetakeComplete: PropTypes.func.isRequired,
};

export default RecordingPanel;
