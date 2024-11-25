import { AnimatePresence, motion } from 'framer-motion';
// LibraryPage.js
import { useEffect, useState } from 'react';

import MusicCard from '../components/MusicCard';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import config from '../config';

const LibraryPage = () => {
  const [musicData, setMusicData] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const response = await axios.get(config.apiUrl);
        if (Array.isArray(response.data)) {
          setMusicData(response.data);
          setFilteredMusic(response.data);
        }
      } catch (error) {
        console.error('Error fetching music data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  const handleSearch = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const filtered = musicData.filter(music => 
      music.composerLastName.toLowerCase().includes(term) ||
      music.composerFullName.toLowerCase().includes(term) ||
      music.title.toLowerCase().includes(term) ||
      (music.opusNumber && music.opusNumber.toLowerCase().includes(term)) ||
      (music.instrumentOrVoiceType && music.instrumentOrVoiceType.toLowerCase().includes(term))
    );
    setFilteredMusic(filtered);
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 
                           animate-gradient-x">
              Classical Music Library
            </span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Explore our curated collection of classical masterpieces
          </motion.p>
        </motion.div>

        <SearchBar onSearch={handleSearch} />

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin" />
              <div className="absolute inset-0 rounded-full border-r-2 border-l-2 border-pink-500 animate-spin-slow" />
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredMusic.map((music, index) => (
                <motion.div
                  key={music._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MusicCard
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
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.main>
  );
};

export default LibraryPage;
