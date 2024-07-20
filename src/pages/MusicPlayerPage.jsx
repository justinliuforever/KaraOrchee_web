import React, { useEffect, useState } from 'react';

import AudioPlayer from '../components/AudioPlayer';
import apiUrl from '../config';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MusicPlayerPage = () => {
  const { id } = useParams();
  const [musicData, setMusicData] = useState(null);
  const [currentScoreIndex, setCurrentScoreIndex] = useState(0);

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

  const handleNextScore = () => {
    setCurrentScoreIndex((prevIndex) => (prevIndex + 1) % musicData.musicScore.fullScore.length);
  };

  const handlePreviousScore = () => {
    setCurrentScoreIndex((prevIndex) => (prevIndex - 1 + musicData.musicScore.fullScore.length) % musicData.musicScore.fullScore.length);
  };

  const handleThumbnailClick = (index) => {
    setCurrentScoreIndex(index);
  };

  if (!musicData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <div className="max-w-4xl mx-auto">
        {/* <img src={musicData.musicPictureURL} alt={`${musicData.title} Album Cover`} className="w-full rounded mb-5" /> */}
        <h1 className="text-4xl font-bold mb-2">{musicData.title}</h1>
        <h2 className="text-2xl mb-5">{musicData.artist}</h2>
        <div className="mt-5">
          <p>{musicData.description}</p>
        </div>
        <div className="mt-5">
          <h3 className="text-2xl mb-2">Full Score</h3>
          <div className="relative w-full" data-carousel="slide">
            <div className="relative h-56 md:h-96 overflow-hidden rounded-lg flex items-center justify-center">
              {musicData.musicScore.fullScore.map((score, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentScoreIndex ? 'opacity-100' : 'opacity-0'}`} data-carousel-item={index === currentScoreIndex ? 'active' : ''}>
                  <img src={score} className="block max-w-full max-h-full object-contain mx-auto" alt={`Full Score Page ${index + 1}`} />
                </div>
              ))}
            </div>
            <button type="button" className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" onClick={handlePreviousScore}>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1L1 5l4 4" />
                </svg>
                <span className="sr-only">Previous</span>
              </span>
            </button>
            <button type="button" className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" onClick={handleNextScore}>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 9l4-4-4-4" />
                </svg>
                <span className="sr-only">Next</span>
              </span>
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-5">
            {musicData.musicScore.fullScore.map((score, index) => (
              <div key={index}>
                <img
                  className={`h-auto max-w-full rounded-lg cursor-pointer ${index === currentScoreIndex ? 'border-2 border-white' : ''}`}
                  src={score}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleThumbnailClick(index)}
                />
              </div>
            ))}
          </div>
          {/* <audio controls className="w-full">
            <source src={musicData.musicAudioURL} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio> */}
          <AudioPlayer/>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;
