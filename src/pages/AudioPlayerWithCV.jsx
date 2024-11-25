import { useEffect, useRef, useState } from 'react';

import AudioControlBar from '../components/AudioControlBar';
import HeadPoseControl from '../components/HeadPoseControl';
import { motion } from 'framer-motion';

const AudioPlayerWithCV = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHeadDetected, setIsHeadDetected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicData, setMusicData] = useState(null);
  const [activeCadenza, setActiveCadenza] = useState(null);
  const [isInCadenza, setIsInCadenza] = useState(false);

  const handleUnlock = () => {
    console.log('Cadenza unlocked, waiting for play gesture');
  };

  const handlePlay = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleHeadDetectionChange = (detected) => {
    setIsHeadDetected(detected);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    // Fetch music data when component mounts
    const fetchMusicData = async () => {
      try {
        const response = await fetch('http://localhost:5555/music/67394319ae95c7ce27178990');
        const data = await response.json();
        setMusicData(data);
      } catch (error) {
        console.error('Error fetching music data:', error);
      }
    };

    fetchMusicData();
  }, []);

  // Convert time string (e.g., "8'56''") to seconds
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const [minutes, seconds] = timeStr.split("'").map(part => parseFloat(part.replace("'", "")));
    return minutes * 60 + seconds;
  };

  // Check if current time is within any cadenza
  useEffect(() => {
    if (musicData?.cadenzaTimeFrames) {
      const currentCadenza = musicData.cadenzaTimeFrames.find(cadenza => {
        const start = timeStringToSeconds(cadenza.beginning);
        const end = timeStringToSeconds(cadenza.ending);
        return currentTime >= start && currentTime <= end;
      });
      setIsInCadenza(!!currentCadenza);
      setActiveCadenza(currentCadenza || null);
    }
  }, [currentTime, musicData]);

  const handleCadenzaClick = (cadenza) => {
    if (audioRef.current) {
      const startTime = timeStringToSeconds(cadenza.beginning);
      audioRef.current.currentTime = startTime;
      setActiveCadenza(cadenza);
      handlePause();
    }
  };

  const handleCadenzaComplete = () => {
    if (audioRef.current && activeCadenza) {
      const endTime = timeStringToSeconds(activeCadenza.ending);
      audioRef.current.currentTime = endTime;
      setActiveCadenza(null);
      handlePlay();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          {musicData ? musicData.title : 'Loading...'}
        </h1>
        
        {/* Cadenza Timeline */}
        {musicData?.cadenzaTimeFrames && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Cadenza Sections
            </h2>
            <div className="flex flex-wrap gap-4">
              {musicData.cadenzaTimeFrames.map((cadenza, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleCadenzaClick(cadenza)}
                  className={`px-6 py-3 rounded-lg shadow-md ${
                    activeCadenza === cadenza
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-medium">Cadenza {index + 1}</span>
                  <span className="block text-sm opacity-80">
                    {cadenza.beginning} - {cadenza.ending}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-8 justify-center mb-8">
          {isInCadenza && (
            <HeadPoseControl 
              onUnlock={handleUnlock} 
              onPlay={handleCadenzaComplete} 
              isPlaying={isPlaying} 
              onHeadDetectionChange={handleHeadDetectionChange}
            />
          )}
          <div className="text-gray-700 dark:text-gray-300">
            <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
            <p>Head Detected: {isHeadDetected ? 'Yes' : 'No'}</p>
            {isInCadenza && <p className="text-blue-500">In Cadenza Section</p>}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={musicData?.soundTracks[0]?.wav || ''}
          onEnded={handlePause}
          onPause={handlePause}
          className="hidden"
        ></audio>
        <AudioControlBar 
          audioRef={audioRef}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          currentTime={currentTime}
          duration={duration}
          musicData={musicData}
          timeStringToSeconds={timeStringToSeconds}
        />
      </div>
    </div>
  );
};

export default AudioPlayerWithCV;
