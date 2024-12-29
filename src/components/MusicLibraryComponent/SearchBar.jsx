import { motion } from 'framer-motion';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="relative w-full group">
      {/* Background glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 
                      rounded-xl opacity-30 group-hover:opacity-50 blur transition-all duration-300"></div>
      
      {/* Input container */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by title, composer, opus, or instrument..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-800/50 text-white placeholder-gray-400 
                   px-12 py-3.5 rounded-xl
                   border border-purple-500/20 group-hover:border-purple-500/40
                   focus:outline-none focus:border-purple-500/50 focus:ring-2 
                   focus:ring-purple-500/20 
                   backdrop-blur-sm shadow-lg shadow-purple-900/20"
        />

        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <motion.svg
            className="w-5 h-5 text-purple-400 group-hover:text-purple-300"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </motion.svg>
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 
                      pointer-events-none"></div>
      </div>
    </div>
  );
};

export default SearchBar;
