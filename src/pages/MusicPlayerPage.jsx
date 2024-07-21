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

  const handleToggleScore = (scoreType) => {
    setIsFullScore(scoreType === 'full');
    setCurrentScoreIndex(0);
  };

  if (!musicData) {
    return <div>Loading...</div>;
  }

  const scoreArray = isFullScore ? musicData.musicScore.fullScore : musicData.musicScore.pianoReduction;

  return (
    <div className="relative min-h-screen text-white p-5 bg-slate-950">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] z-0"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] z-0"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold mb-2">{musicData.title}</h1>
        <div className="mt-5">
          <p>{musicData.description}</p>
        </div>
        <div className="mt-5">
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
              <li className="me-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${isFullScore ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'} relative z-20`}
                  onClick={() => handleToggleScore('full')}
                  type="button"
                >
                  Full Score
                </button>
              </li>
              <li className="me-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${!isFullScore ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'} relative z-20`}
                  onClick={() => handleToggleScore('piano')}
                  type="button"
                >
                  Piano Reduction
                </button>
              </li>
            </ul>
          </div>
          <ScoreDisplay
            scoreArray={scoreArray}
            currentScoreIndex={currentScoreIndex}
            handleNextScore={handleNextScore}
            handlePreviousScore={handlePreviousScore}
            handleThumbnailClick={handleThumbnailClick}
          />
        </div>
        <div className="py-4">
          <AudioPlayer />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;
