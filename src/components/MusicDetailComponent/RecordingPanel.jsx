import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';

import PropTypes from 'prop-types';

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

const TimeControl = ({ currentTime, duration, onSeek }) => {
  const timeControls = [
    { seconds: -10, label: '10s', icon: 'backward' },
    { seconds: -5, label: '5s', icon: 'backward' },
    { seconds: 5, label: '5s', icon: 'forward' },
    { seconds: 10, label: '10s', icon: 'forward' },
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {timeControls.map((control, index) => (
        <motion.button
          key={index}
          onClick={() => {
            const newTime = control.seconds < 0
              ? Math.max(0, currentTime + control.seconds)
              : Math.min(duration, currentTime + control.seconds);
            onSeek(newTime);
          }}
          className="flex flex-col items-center p-3 rounded-xl bg-white/5 
                   hover:bg-white/10 text-white/70 hover:text-white
                   transition-colors group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg 
            className={`w-5 h-5 mb-1 ${control.seconds < 0 ? 'rotate-180' : ''}`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4z" 
            />
          </svg>
          <span className="text-xs font-medium">{control.label}</span>
        </motion.button>
      ))}
    </div>
  );
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
  recordingPlaybackTime,
  seekRecordingPlayback,
  onDownloadRecording,
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const recordingPlayerRef = useRef(null);

  const handleSeekBackward = () => {
    if (recordingPlayerRef.current) {
      const newTime = Math.max(0, recordingPlayerRef.current.currentTime - 5);
      seekRecordingPlayback(newTime);
    }
  };

  const handleSeekForward = () => {
    if (recordingPlayerRef.current) {
      const newTime = Math.min(duration, recordingPlayerRef.current.currentTime + 5);
      seekRecordingPlayback(newTime);
    }
  };

  const handleTimelineSeek = (e) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const seekPercentage = (e.clientX - rect.left) / rect.width;
    const seekTime = seekPercentage * duration;
    seekRecordingPlayback(seekTime);
  };

  return (
    <motion.div 
      className="fixed bottom-24 left-0 right-0 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {/* Recording Status with Wave Animation */}
                <div className="flex flex-col items-center mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <motion.div
                        className="w-4 h-4 rounded-full bg-red-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                      <motion.div
                        className="absolute inset-0 w-4 h-4 rounded-full bg-red-500"
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-2xl font-medium text-red-300">Recording</span>
                  </div>
                  {/* Sound Wave Animation */}
                  <div className="flex items-center gap-1 h-8">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-red-400/60 rounded-full"
                        animate={{ 
                          height: [8, 24, 8],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <span className="mt-4 text-3xl font-mono text-white/80">{formatTime(currentTime)}</span>
                </div>
                
                <motion.button
                  onClick={onStopRecording}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 
                           text-white font-medium text-lg tracking-wide relative
                           shadow-lg shadow-red-500/20 hover:shadow-red-500/30
                           overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Stop Recording</span>
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </motion.div>
            ) : recordedAudio ? (
              <motion.div
                key="playback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-white/10"
              >
                {/* Playback Controls Section */}
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.button
                        onClick={isPlayingRecording ? onPauseRecording : onPlayRecording}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-medium
                                  ${isPlayingRecording 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20' 
                                    : 'bg-white/5 text-green-300 hover:bg-white/10'}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PlayPauseIcon isPlaying={isPlayingRecording} />
                        {isPlayingRecording ? 'Pause' : 'Play'}
                      </motion.button>
                      
                      {/* Download Button */}
                      <motion.button
                        onClick={onDownloadRecording}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 
                                 text-blue-300 hover:text-blue-200 transition-colors
                                 group relative"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg 
                          className="w-6 h-6" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                     px-2 py-1 text-xs font-medium text-white bg-gray-900 
                                     rounded-md opacity-0 group-hover:opacity-100 
                                     transition-opacity whitespace-nowrap">
                          Download Recording
                        </span>
                      </motion.button>
                    </div>
                    <span className="text-xl font-mono tracking-wider text-white/80">
                      {formatTime(recordingPlaybackTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-white/60 mb-3">Quick Navigation</h4>
                    <TimeControl 
                      currentTime={recordingPlaybackTime}
                      duration={duration}
                      onSeek={seekRecordingPlayback}
                    />
                  </div>
                </div>

                {/* Enhanced Rehearsal Points Section */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-medium text-white/80 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rehearsal Points
                  </h3>
                  <div className="grid grid-cols-6 gap-3">
                    {rehearsalPoints?.map((point, index) => (
                      <motion.button
                        key={index}
                        onClick={() => onRehearsalPointSelect(point)}
                        className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 relative
                          ${currentRehearsalPoint?.letter === point.letter
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white/5 text-blue-300 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10'
                          }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-2xl font-medium mb-1">{point.letter}</div>
                        <div className="text-xs opacity-60">{point.time}</div>
                        {currentRehearsalPoint?.letter === point.letter && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-blue-400"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Action Buttons Section */}
                <div className="p-6 flex gap-4">
                  <motion.button
                    onClick={onStartRecording}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                             text-white font-medium text-lg tracking-wide relative overflow-hidden
                             shadow-lg shadow-blue-500/20 group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">
                      {currentRehearsalPoint 
                        ? `Re-record from ${currentRehearsalPoint.letter}` 
                        : 'Start New Recording'
                      }
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                  <motion.button
                    onClick={onClearRecording}
                    className="px-8 py-4 rounded-xl bg-red-500/20 text-red-300 
                             font-medium text-lg tracking-wide relative overflow-hidden
                             hover:bg-red-500/30 group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Clear</span>
                    <motion.div 
                      className="absolute inset-0 bg-red-500/10"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
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
  recordingPlaybackTime: PropTypes.number.isRequired,
  seekRecordingPlayback: PropTypes.func.isRequired,
  onDownloadRecording: PropTypes.func.isRequired,
};

export default RecordingPanel;
