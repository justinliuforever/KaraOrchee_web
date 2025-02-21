import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import AudioControlBar from '../components/MusicDetailComponent/AudioControlBar';
import HeadPoseControl from '../components/MusicDetailComponent/HeadPoseControl';
import LoadingScreen from '../components/LoadingScreen';
import RecordingPanel from '../components/MusicDetailComponent/RecordingPanel';
import config from '../config';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useParams } from 'react-router-dom';

const MusicDetailPage = () => {
  // Refs
  const audioRef = useRef(null);

  // Consolidated loading state for better management
  const [loading, setLoading] = useState({
    isLoading: true,
    progress: 0,
    status: 'Initializing...',
  });

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Other local states
  const [isHeadDetected, setIsHeadDetected] = useState(false);
  const [musicData, setMusicData] = useState(null);
  const [activeCadenza, setActiveCadenza] = useState(null);
  const [isInCadenza, setIsInCadenza] = useState(false);
  const { id } = useParams();
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [currentRehearsalPoint, setCurrentRehearsalPoint] = useState(null);

  // Audio Recorder hook usage
  const {
    isRecording,
    recordedAudio,
    recordedSegments,
    recordingProgress,
    isPlayingRecording,
    recordingPlaybackTime,
    recordingPlayerRef,
    startRecording,
    stopRecording,
    clearRecording,
    seekRecordingPlayback,
    playRecording,
    pauseRecording,
    updateRecordingProgress,
    startRetake,
    mergeRecordings,
  } = useAudioRecorder();

  // Helper function: Convert time string to seconds.
  const timeStringToSeconds = useCallback((timeStr) => {
    if (!timeStr) return 0;
    // Handle the "minutes'seconds''" format (e.g., "11'51''")
    if (timeStr.includes("'")) {
      const [minutes, seconds] = timeStr.split("'").map(
        (part) => parseInt(part.replace(/"/g, ''), 10) || 0
      );
      return minutes * 60 + seconds;
    }
    // Handle the "minutes:seconds" format (e.g., "11:51")
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  }, []);

  // Event Handlers

  // Play the audio backtrack
  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Pause the audio backtrack
  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // Called by HeadPoseControl when head is lifted (unlock)
  const handleUnlock = useCallback(() => {
    console.log('Cadenza unlocked, waiting for play gesture');
  }, []);

  // Update head detection status
  const handleHeadDetectionChange = useCallback((detected) => {
    setIsHeadDetected(detected);
  }, []);

  // Jump to cadenza start time and pause backtrack playback
  const handleCadenzaClick = useCallback(
    (cadenza) => {
      const audio = audioRef.current;
      if (audio) {
        const startTime = timeStringToSeconds(cadenza.beginning);
        console.log('Cadenza start time:', startTime); // Debug log
        if (isFinite(startTime)) {
          audio.currentTime = startTime;
          setActiveCadenza(cadenza);
          setIsInCadenza(true);
          handlePause();
        } else {
          console.error('Invalid time format:', cadenza.beginning);
        }
      }
    },
    [handlePause, timeStringToSeconds]
  );

  // Called when the user nods to complete the cadenza interaction.
  // Skips the cadenza section (with a slight offset) and resumes playback.
  const handleCadenzaComplete = useCallback(() => {
    const audio = audioRef.current;
    if (audio && activeCadenza) {
      const endTime = timeStringToSeconds(activeCadenza.ending);
      if (isFinite(endTime)) {
        // Add an offset to ensure we leave the cadenza interval
        audio.currentTime = endTime + 0.1;
        setActiveCadenza(null);
        setIsInCadenza(false);
        handlePlay(); // Resume playback after cadenza
      } else {
        console.error('Invalid time format:', activeCadenza.ending);
      }
    }
  }, [activeCadenza, handlePlay, timeStringToSeconds]);

  // Called when the head pose control is closed; stops the recording and resets cadenza state.
  const handleCloseHeadPose = useCallback(() => {
    if (isRecordingMode) {
      stopRecording();
    }
    setIsInCadenza(false);
    setActiveCadenza(null);
  }, [isRecordingMode, stopRecording]);

  // Toggle between normal mode and recording mode.
  const handleToggleMode = useCallback(() => {
    if (isRecording) {
      handleRecordingStop();
    }
    setIsRecordingMode((prev) => !prev);
  }, [isRecording]);

  // Start recording. If a rehearsal point is selected, seek to that time before recording.
  const handleRecordingStart = useCallback(() => {
    if (!isRecordingMode) return;
    const audio = audioRef.current;
    if (currentRehearsalPoint) {
      const time = timeStringToSeconds(currentRehearsalPoint.time);
      if (audio) {
        audio.currentTime = time;
      }
      startRecording(time);
    } else {
      if (audio) {
        audio.currentTime = 0;
      }
      startRecording(0);
    }
    handlePlay();
  }, [currentRehearsalPoint, isRecordingMode, startRecording, handlePlay, timeStringToSeconds]);

  // Stop recording and pause playback.
  const handleRecordingStop = useCallback(() => {
    if (!isRecordingMode) return;
    stopRecording();
    handlePause();
  }, [isRecordingMode, stopRecording, handlePause]);

  // In recording mode, toggle play/pause for the recording playback.
  const handlePlayInRecordingMode = useCallback(() => {
    if (recordedAudio) {
      if (isPlayingRecording) {
        pauseRecording();
      } else {
        playRecording();
      }
    } else {
      handleRecordingStart();
    }
  }, [recordedAudio, isPlayingRecording, pauseRecording, playRecording, handleRecordingStart]);

  // Seek to a specific time in the backtrack (and update recording progress if necessary).
  const handleSeek = useCallback(
    (seekTime) => {
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = seekTime;
          if (isRecording) {
            updateRecordingProgress(seekTime);
          }
          if (isRecordingMode && recordedAudio) {
            seekRecordingPlayback(seekTime);
          }
        } catch (error) {
          console.error('Seek error:', error);

          audio.load();
          setTimeout(() => {
            audio.currentTime = seekTime;
            if (!isPlaying) {
              audio.pause();
            }
          }, 100);
        }
      }
    },
    [isRecording, isRecordingMode, recordedAudio, updateRecordingProgress, seekRecordingPlayback, isPlaying]
  );

  // Handle rehearsal point click.
  // If already selected, deselect it; otherwise, update current rehearsal point.
  // In recording mode with an existing recording, start the retake at the selected point.
  const handleRehearsalClick = useCallback(
    (point) => {
      const audio = audioRef.current;
      if (!point || !audio) return;
      if (currentRehearsalPoint?.letter === point.letter) {
        setCurrentRehearsalPoint(null);
        return;
      }
      const time = timeStringToSeconds(point.time);
      setCurrentRehearsalPoint(point);
      if (isRecordingMode && recordedAudio) {
        startRetake(point);
      } else {
        audio.currentTime = time;
        if (!isPlaying) {
          handlePlay();
        }
      }
    },
    [currentRehearsalPoint, isRecordingMode, recordedAudio, isPlaying, handlePlay, startRetake, timeStringToSeconds]
  );

  // Handle completion of retake recording.
  const handleRetakeComplete = useCallback(() => {
    handleRecordingStop();
    mergeRecordings();
  }, [handleRecordingStop, mergeRecordings]);

  const handleDownloadRecording = () => {
    if (recordedAudio) {
      const link = document.createElement('a');
      link.href = recordedAudio;
      link.download = `recording-${new Date().toISOString()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Effects

  // Load resources (music data, cover art, and audio) sequentially.
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Step 1: Fetch music data
        setLoading((prev) => ({ ...prev, status: 'Fetching music data...', progress: 20 }));
        const response = await fetch(`${config.apiUrl}/${id}`);
        const data = await response.json();

        // Step 2: Preload cover art
        setLoading((prev) => ({ ...prev, status: 'Loading cover art...', progress: 40 }));
        if (data.coverImageUrl) {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = data.coverImageUrl;
          });
        }

        // Step 3: Preload audio
        setLoading((prev) => ({ ...prev, status: 'Loading audio...', progress: 60 }));
        if (data.soundTracks?.[0]?.wav) {
          const audio = audioRef.current;
          if (audio) {
            audio.preload = 'auto';
            audio.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              const handleCanPlay = () => {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('error', handleError);
                setLoading((prev) => ({ ...prev, progress: 90 }));
                resolve();
              };

              const handleError = (error) => {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('error', handleError);
                reject(error);
              };

              audio.addEventListener('canplay', handleCanPlay);
              audio.addEventListener('error', handleError);
              
              audio.src = data.soundTracks[0].wav;
              audio.load();
            });
          }
        }

        // Step 4: Initialize audio element
        setLoading((prev) => ({ ...prev, status: 'Preparing playback...', progress: 100 }));
        setMusicData(data);
        // Allow some time for audio element to fully initialize
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Error loading resources:', error);
        setLoading((prev) => ({ 
          ...prev, 
          status: 'Error loading resources. Please try again.',
          isLoading: false 
        }));
      }
    };

    loadResources();
  }, [id]);

  // Update current time and duration based on audio element events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || loading.isLoading) return;

    const updateTime = () => {
      const currentAudioTime = audio.currentTime;
      setCurrentTime(currentAudioTime);
      if (isRecording) {
        updateRecordingProgress(currentAudioTime);
      }
    };

    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [loading.isLoading, isRecording, updateRecordingProgress]);

  // Track the current cadenza; pause playback when entering a cadenza interval
  useEffect(() => {
    if (!loading.isLoading && musicData?.cadenzaTimeFrames) {
      const currentCadenza = musicData.cadenzaTimeFrames.find((cadenza) => {
        const start = timeStringToSeconds(cadenza.beginning);
        const end = timeStringToSeconds(cadenza.ending);
        return currentTime >= start && currentTime < end;
      });

      // Update cadenza states
      setIsInCadenza(!!currentCadenza);
      setActiveCadenza(currentCadenza || null);

      // Pause playback when entering a cadenza
      const audio = audioRef.current;
      if (currentCadenza && audio && !audio.paused) {
        handlePause();
      }
    }
  }, [currentTime, musicData, loading.isLoading, handlePause, timeStringToSeconds]);

  // Cleanup on unmount: reset the current rehearsal point.
  useEffect(() => {
    return () => {
      setCurrentRehearsalPoint(null);
    };
  }, []);

  // If still loading resources, render a loading screen.
  if (loading.isLoading) {
    return <LoadingScreen progress={loading.progress} status={loading.status} />;
  }

  // Main render
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),rgba(15,23,42,0))]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.4),rgba(15,23,42,0))]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-12 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start gap-12 mb-16">
          {/* Cover Image */}
          <motion.div
            className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl relative group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={musicData?.coverImageUrl || 'https://via.placeholder.com/256'}
              alt="Album cover"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Music Information */}
          <div className="flex-1 text-white">
            <motion.h1
              className="text-6xl font-serif mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {musicData?.title || 'Loading...'}
            </motion.h1>
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-2xl text-blue-200">{musicData?.composerFullName}</p>
              <p className="text-lg text-blue-300/80 font-light">
                {musicData?.opusNumber} in {musicData?.key}
              </p>
              <div className="flex items-center space-x-2 text-blue-300/60">
                <span>{musicData?.instrumentOrVoiceType}</span>
                <span>•</span>
                <span>Movement {musicData?.movementNumber}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cadenza Sections */}
        {musicData?.cadenzaTimeFrames && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-serif mb-8 text-blue-200">Interactive Cadenza Points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {musicData.cadenzaTimeFrames.map((cadenza, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleCadenzaClick(cadenza)}
                  className={`
                    relative overflow-hidden rounded-xl p-6 backdrop-blur-sm
                    ${activeCadenza === cadenza
                      ? 'bg-blue-500/30 ring-2 ring-blue-400'
                      : 'bg-white/5 hover:bg-white/10'
                    }
                    transition-all duration-300
                  `}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative z-10">
                    <span className="block font-serif text-lg mb-2 text-blue-200">Cadenza {index + 1}</span>
                    <span className="block text-sm text-blue-300/60">
                      {cadenza.beginning} - {cadenza.ending}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rehearsal Points Section */}
        {musicData?.rehearsalNumbers && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-serif mb-8 text-blue-200">Rehearsal Points</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {musicData.rehearsalNumbers.map((point, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleRehearsalClick(point)}
                  className={`
                    relative overflow-hidden rounded-xl p-4 backdrop-blur-sm
                    ${currentRehearsalPoint === point
                      ? 'bg-green-500/30 ring-2 ring-green-400'
                      : 'bg-white/5 hover:bg-white/10'
                    }
                    transition-all duration-300
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative z-10">
                    <span className="block font-serif text-xl mb-1 text-green-200">{point.letter}</span>
                    <span className="block text-sm text-green-300/60">{point.time}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recording Panel */}
        <AnimatePresence>
          {isRecordingMode && (
            <RecordingPanel
              isRecording={isRecording}
              recordedAudio={recordedAudio}
              currentTime={currentTime}
              duration={duration}
              onStartRecording={handleRecordingStart}
              onStopRecording={handleRecordingStop}
              onPlayRecording={playRecording}
              onPauseRecording={pauseRecording}
              isPlayingRecording={isPlayingRecording}
              recordedSegments={recordedSegments}
              rehearsalPoints={musicData?.rehearsalNumbers}
              onRehearsalPointSelect={handleRehearsalClick}
              currentRehearsalPoint={currentRehearsalPoint}
              onClearRecording={clearRecording}
              onRetakeComplete={handleRetakeComplete}
              recordingPlaybackTime={recordingPlaybackTime}
              seekRecordingPlayback={seekRecordingPlayback}
              onDownloadRecording={handleDownloadRecording}
            />
          )}
        </AnimatePresence>

        {/* Head Pose Control Section */}
        <div className="flex justify-center mb-12">
          <AnimatePresence>
            {isInCadenza && (
              <HeadPoseControl
                onUnlock={handleUnlock}
                onPlay={handleCadenzaComplete}
                isPlaying={isPlaying}
                onHeadDetectionChange={handleHeadDetectionChange}
                onClose={handleCloseHeadPose}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={musicData?.soundTracks[0]?.wav || ''}
          onEnded={handlePause}
          onPause={handlePause}
          className="hidden"
        />
      </div>

      {/* Audio Control Bar */}
      <AudioControlBar
        audioRef={audioRef}
        isPlaying={isRecordingMode ? isPlayingRecording : isPlaying}
        onPlay={isRecordingMode ? playRecording : handlePlay}
        onPause={isRecordingMode ? pauseRecording : handlePause}
        currentTime={currentTime}
        duration={duration}
        musicData={musicData}
        timeStringToSeconds={timeStringToSeconds}
        isRecordingMode={isRecordingMode}
        onToggleMode={handleToggleMode}
        rehearsalPoints={musicData?.rehearsalNumbers}
        onRehearsalPointClick={handleRehearsalClick}
        currentRehearsalPoint={currentRehearsalPoint}
      />
    </div>
  );
};

export default MusicDetailPage;
