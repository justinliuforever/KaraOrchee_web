// LibraryPage.js
import { useEffect, useState } from 'react';

import MusicCard from '../components/MusicCard';
import axios from 'axios';
import config from '../config';

const LibraryPage = () => {
  const [musicData, setMusicData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const response = await axios.get(config.apiUrl);
        if (Array.isArray(response.data)) {
          setMusicData(response.data);
        }
      } catch (error) {
        console.error('Error fetching music data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Classical Music Library
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our curated collection of classical masterpieces
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {musicData.map((music) => (
              <MusicCard
                key={music._id}
                imageUrl={music.coverImageUrl}
                title={music.title}
                composerLastName={music.composerLastName}
                composerFullName={music.composerFullName}
                opus={music.opusNumber}
                musicalKey={music.key}
                duration={music.duration}
                instrumentOrVoiceType={music.instrumentOrVoiceType}
                movementNumber={music.movementNumber}
                id={music._id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default LibraryPage;
