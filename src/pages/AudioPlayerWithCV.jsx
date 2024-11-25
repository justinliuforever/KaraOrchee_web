import { useEffect, useRef, useState } from 'react';

import AudioControlBar from '../components/AudioControlBar';
import HeadPoseControl from '../components/HeadPoseControl';

const AudioPlayerWithCV = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHeadDetected, setIsHeadDetected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicData, setMusicData] = useState(null);

  const handleUnlock = () => {
    console.log('Unlocked');
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">
        {musicData ? musicData.title : 'Loading...'}
      </h1>
      <audio
        ref={audioRef}
        src={musicData?.soundTracks[0]?.wav || ''}
        onEnded={handlePause}
        onPause={handlePause}
        className="hidden"
      ></audio>
      <div className="flex items-center space-x-8">
        <HeadPoseControl 
          onUnlock={handleUnlock} 
          onPlay={handlePlay} 
          isPlaying={isPlaying} 
          onHeadDetectionChange={handleHeadDetectionChange}
        />
        <div>
          <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
          <p>Head Detected: {isHeadDetected ? 'Yes' : 'No'}</p>
        </div>
      </div>
      <AudioControlBar 
        audioRef={audioRef}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        currentTime={currentTime}
        duration={duration}
        musicData={musicData}
      />
    </div>
  );
};

export default AudioPlayerWithCV;
