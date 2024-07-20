// src/pages/MusicPlayerPage.js
import React, { useEffect, useState } from 'react';

import AudioPlayer from '../components/MusicPlayerComponent/AudioPlayer';
import ScoreDisplay from '../components/MusicPlayerComponent/ScoreDisplay';
import apiUrl from '../config';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MusicPlayerPage = () => {
  const { id } = useParams();
  const [musicData, setMusicData] = useState(null);
  const [currentScoreIndex, setCurrentScoreIndex] = useState(0);
  const [isFullScore, setIsFullScore] = useState(true);

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
    const scoreArray = isFullScore ? musicData.musicScore.fullScore : musicData.musicScore.pianoReduction;
    setCurrentScoreIndex((prevIndex) => (prevIndex + 1) % scoreArray.length);
  };

  const handlePreviousScore = () => {
    const scoreArray = isFullScore ? musicData.musicScore.fullScore : musicData.musicScore.pianoReduction;
    setCurrentScoreIndex((prevIndex) => (prevIndex - 1 + scoreArray.length) % scoreArray.length);
  };

  const handleThumbnailClick = (index) => {
    setCurrentScoreIndex(index);
  };

  const handleToggleScore = () => {
    setIsFullScore(!isFullScore);
    setCurrentScoreIndex(0);
  };

  if (!musicData) {
    return <div>Loading...</div>;
  }

  const scoreArray = isFullScore ? musicData.musicScore.fullScore : musicData.musicScore.pianoReduction;
  const scoreTitle = isFullScore ? "Full Score" : "Piano Reduction";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{musicData.title}</h1>
        <div className="mt-5">
          <p>{musicData.description}</p>
        </div>
        <div className="mt-5">
          <button
            className="mb-5 px-4 py-2 bg-lime-500 hover:bg-lime-700 text-white font-bold rounded"
            onClick={handleToggleScore}
          >
            Current is: {isFullScore ? "Full Score" : "Piano Reduction"}
          </button>
          <ScoreDisplay
            scoreArray={scoreArray}
            currentScoreIndex={currentScoreIndex}
            handleNextScore={handleNextScore}
            handlePreviousScore={handlePreviousScore}
            handleThumbnailClick={handleThumbnailClick}
          />
        </div>
        <div className="py-4">
          <AudioPlayer/>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;
