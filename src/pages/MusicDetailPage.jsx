import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import AudioControlBar from '../components/AudioControlBar';
import HeadPoseControl from '../components/HeadPoseControl';
import LoadingScreen from '../components/LoadingScreen';
import config from '../config';
import { useParams } from 'react-router-dom';

const MusicDetailPage = () => {
  // 1. All useRef hooks
  const audioRef = useRef(null);

  // 2. All useState hooks
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHeadDetected, setIsHeadDetected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicData, setMusicData] = useState(null);
  const [activeCadenza, setActiveCadenza] = useState(null);
  const [isInCadenza, setIsInCadenza] = useState(false);
  const { id } = useParams();

  // 3. Helper functions (defined before useEffect)
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const [minutes, seconds] = timeStr.split("'").map(part => parseFloat(part.replace("'", "")));
    return minutes * 60 + seconds;
  };

  // 4. Event handlers
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

  const handleUnlock = () => {
    console.log('Cadenza unlocked, waiting for play gesture');
  };

  const handleHeadDetectionChange = (detected) => {
    setIsHeadDetected(detected);
  };

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

  const handleCloseHeadPose = () => {
    setIsInCadenza(false);
    setActiveCadenza(null);
  };

  // 5. All useEffect hooks
  // Resource loading effect
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Step 1: Fetch music data
        setLoadingStatus('Fetching music data...');
        setLoadingProgress(20);
        const response = await fetch(`${config.apiUrl}/${id}`);
        const data = await response.json();
        
        // Step 2: Preload cover image
        setLoadingStatus('Loading cover art...');
        setLoadingProgress(40);
        if (data.coverImageUrl) {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = data.coverImageUrl;
          });
        }

        // Step 3: Preload audio
        setLoadingStatus('Loading audio...');
        setLoadingProgress(60);
        if (data.soundTracks?.[0]?.wav) {
          const audio = new Audio(data.soundTracks[0].wav);
          await new Promise((resolve, reject) => {
            audio.addEventListener('loadeddata', () => {
              setLoadingProgress(90);
              resolve();
            }, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load(); // 确保开始加载音频
          });
        }

        // Step 4: Initialize audio element
        setLoadingStatus('Preparing playback...');
        setLoadingProgress(100);
        setMusicData(data);
        
        // 给音频元素一些时间完全初始化
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading resources:', error);
        setLoadingStatus('Error loading resources. Please try again.');
      }
    };

    loadResources();
  }, [id]);

  // Audio time update effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [isLoading]);

  // Cadenza tracking effect
  useEffect(() => {
    if (!isLoading && musicData?.cadenzaTimeFrames) {
      const currentCadenza = musicData.cadenzaTimeFrames.find(cadenza => {
        const start = timeStringToSeconds(cadenza.beginning);
        const end = timeStringToSeconds(cadenza.ending);
        return currentTime >= start && currentTime <= end;
      });
      setIsInCadenza(!!currentCadenza);
      setActiveCadenza(currentCadenza || null);
    }
  }, [currentTime, musicData, isLoading]);

  // 6. Conditional rendering for loading state
  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} status={loadingStatus} />;
  }

  // 7. Main render
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),rgba(15,23,42,0))]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.4),rgba(15,23,42,0))]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
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
              src={musicData?.coverImageUrl || "https://via.placeholder.com/256"} 
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
            <h2 className="text-2xl font-serif mb-8 text-blue-200">
              Interactive Cadenza Points
            </h2>
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
                    <span className="block font-serif text-lg mb-2 text-blue-200">
                      Cadenza {index + 1}
                    </span>
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
        
        {/* Audio Control Bar */}
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

export default MusicDetailPage;
