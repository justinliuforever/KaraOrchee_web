import React, { useEffect, useRef, useState } from 'react';

import apiUrl from '../../config';
import axios from 'axios';
import back15sImage from './pic/back_15s.png';
import forward15sImage from './pic/forward_15s.png';
import pauseButtonImage from './pic/pause_button.png';
import playButtonImage from './pic/play_button.png';
import { useParams } from 'react-router-dom';

const AudioPlayer = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicData, setMusicData] = useState(null);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const response = await axios.get(`${apiUrl}${id}`);
        setMusicData(response.data);
      } catch (error) {
        console.error('Error fetching music data:', error);
      }
    };

    fetchMusicData();
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioData = () => {
      setDuration(audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', setAudioData);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', setAudioData);
      };
    }
  }, [musicData]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressChange = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = offsetX / rect.width;
    audioRef.current.currentTime = newProgress * duration;
  };

  const handleProgressDrag = (e) => {
    if (e.buttons !== 1) return;
    handleProgressChange(e);
  };

  const rewind15Seconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const forward15Seconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, duration);
    }
  };

  if (!musicData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-tl-xl sm:rounded-t-xl p-4 pb-6 sm:p-8 lg:p-4 lg:pb-6 xl:p-8 space-y-6 sm:space-y-8 lg:space-y-6 xl:space-y-8">
      <div className="flex items-center space-x-3.5 sm:space-x-5 lg:space-x-3.5 xl:space-x-5">
        <img
          src={musicData.musicPictureURL}
          alt={musicData.title}
          width="160"
          height="160"
          className="flex-none w-20 h-20 rounded-lg bg-gray-100"
        />
        <div className="min-w-0 flex-auto space-y-0.5">
          <p className="text-lime-600 dark:text-lime-400 text-sm sm:text-base lg:text-sm xl:text-base font-semibold uppercase">
            <abbr title="Episode">Ep.</abbr> {musicData.title}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg lg:text-base xl:text-lg font-medium">
            {musicData.artist}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div
          className="relative bg-gray-200 dark:bg-black rounded-full overflow-hidden"
          ref={progressBarRef}
          onClick={handleProgressChange}
          onMouseMove={handleProgressDrag}
          style={{ height: '8px' }}
        >
          <div
            className="bg-lime-500 dark:bg-lime-400 h-full"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
          <div
            className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 bg-lime-500 dark:bg-lime-400 rounded-full cursor-pointer"
            style={{ left: `calc(${progress}% - 8px)` }}
            draggable="true"
            onDrag={handleProgressDrag}
          ></div>
        </div>
        <div className="text-gray-500 dark:text-gray-400 flex justify-between text-sm font-medium tabular-nums">
          <div>{formatTime(audioRef.current ? audioRef.current.currentTime : 0)}</div>
          <div>{formatTime(duration)}</div>
        </div>
      </div>
      <div className="bg-gray-50 text-black dark:bg-gray-900 dark:text-white lg:rounded-b-xl py-4 px-1 sm:px-3 lg:px-1 xl:px-3 flex justify-center">
        <button type="button" className="mx-2" onClick={rewind15Seconds}>
          <img src={back15sImage} alt="Rewind 15 seconds" width="50" height="50" />
        </button>
        <button type="button" className="mx-2" onClick={togglePlayPause}>
          <img
            src={isPlaying ? pauseButtonImage : playButtonImage}
            alt={isPlaying ? 'Pause' : 'Play'}
            width="50"
            height="50"
          />
        </button>
        <button type="button" className="mx-2" onClick={forward15Seconds}>
          <img src={forward15sImage} alt="Forward 15 seconds" width="50" height="50" />
        </button>
      </div>
      <audio ref={audioRef} preload="auto" className="w-full mt-4">
        <source src={musicData.musicAudioURL} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
