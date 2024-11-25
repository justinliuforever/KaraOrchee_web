import { motion } from 'framer-motion';
import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mb-12"
    >
      <div className={`relative group ${focused ? 'scale-105' : ''} transition-transform duration-300`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by composer, title, opus number..."
          className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl rounded-lg 
                     border border-white/20 text-white placeholder-white/50
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     transition-all duration-300"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg 
            className="w-6 h-6 text-white/50" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
