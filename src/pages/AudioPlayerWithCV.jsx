import { useRef, useState } from 'react';

import HeadPoseControl from '../components/HeadPoseControl';

const AudioPlayerWithCV = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHeadDetected, setIsHeadDetected] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Audio Player with CV Control</h1>
      <audio
        ref={audioRef}
        src="https://firebasestorage.googleapis.com/v0/b/musicinformaudiostream.appspot.com/o/audios%2F1712787441931_i-allegronontroppemoltomaestoso-backing.mp3?alt=media&token=d9d3333e-b90a-4a43-982e-23ce1318882b"
        onEnded={handlePause}
        onPause={handlePause}
        controls
        className="mb-4"
      ></audio>
      <HeadPoseControl 
        onUnlock={handleUnlock} 
        onPlay={handlePlay} 
        isPlaying={isPlaying} 
        onHeadDetectionChange={handleHeadDetectionChange}
      />
      <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
      <p>Head Detected: {isHeadDetected ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default AudioPlayerWithCV;
