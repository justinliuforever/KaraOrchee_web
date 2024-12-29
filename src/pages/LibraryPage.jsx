import { AnimatePresence, motion } from 'framer-motion';
// LibraryPage.js
import { useEffect, useState } from 'react';

import MusicCard from '../components/MusicLibraryComponent/MusicCard';
import SearchBar from '../components/MusicLibraryComponent/SearchBar';
import axios from 'axios';
import config from '../config';

const LibraryPage = () => {
  const [musicData, setMusicData] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('title');

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

  const handleSort = (option) => {
    setSortOption(option);
    const sorted = [...filteredMusic].sort((a, b) => {
      switch (option) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'composerLastName':
          return a.composerLastName.localeCompare(b.composerLastName);
        case 'opusNumber':
          return (a.opusNumber || '').localeCompare(b.opusNumber || '');
        case 'instrumentOrVoiceType':
          return (a.instrumentOrVoiceType || '').localeCompare(b.instrumentOrVoiceType || '');
        default:
          return 0;
      }
    });
    setFilteredMusic(sorted);
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

        <div className="flex flex-col gap-6 mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-purple-900/20 
                       rounded-2xl backdrop-blur-md border border-purple-500/20 
                       hover:border-purple-500/30 transition-all duration-300 overflow-hidden
                       shadow-[0_0_50px_-12px] shadow-purple-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 
                            opacity-30 animate-gradient-xy pointer-events-none"></div>

            <div className="p-6 space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 
                                rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-500
                                animate-gradient-xy"></div>
                <div className="relative">
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>

              <div className="relative h-px w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-300 text-sm font-medium px-3 py-1 rounded-lg bg-gray-700/30
                                border border-purple-500/20">Sort by</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'title', label: 'Title', icon: '📜' },
                    { value: 'composerLastName', label: 'Composer', icon: '👤' },
                    { value: 'opusNumber', label: 'Opus', icon: '🎼' },
                    { value: 'instrumentOrVoiceType', label: 'Instrument', icon: '🎵' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleSort(option.value)}
                      className={`relative group px-4 py-2 rounded-lg text-sm font-medium 
                                transition-all duration-300 flex items-center gap-2
                                ${sortOption === option.value
                                  ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/20'
                                  : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <span className="relative z-10">{option.icon}</span>
                      <span className="relative z-10">{option.label}</span>
                      {sortOption === option.value && (
                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 relative z-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

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
      </div>
    </motion.main>
  );
};

export default LibraryPage;
