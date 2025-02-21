import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MusicCard = ({ 
  imageUrl, 
  title, 
  composerLastName,
  opus, 
  musicalKey, 
  duration,
  instrumentOrVoiceType,
  movementNumber,
  id 
}) => {
  const navigate = useNavigate();
  const defaultImage = '/default-score.jpg';

  const handleClick = () => {
    navigate(`/Library/${id}`);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="group relative h-[480px] bg-gradient-to-b from-white/10 to-white/5 rounded-2xl 
                 overflow-hidden backdrop-blur-md border border-white/10"
    >
      {/* Top Section - Image */}
      <div className="relative h-[55%] overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-700 
                     group-hover:scale-105"
          src={imageUrl || defaultImage}
          alt={title}
          onError={(e) => { e.target.src = defaultImage; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      {/* Bottom Section - Content */}
      <div className="relative h-[45%] p-6 bg-gradient-to-b from-black/80 to-black/40 
                      backdrop-blur-lg">
        {/* Composer Badge */}
        <div className="absolute -top-4 left-6">
          <span className="px-4 py-1 bg-purple-500/80 backdrop-blur-md rounded-full 
                         text-white font-medium text-sm">
            {composerLastName}
          </span>
        </div>

        {/* Main Content */}
        <div className="mt-4 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
            {title}
          </h3>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            {opus && (
              <span key={`opus-${id}`} className="px-3 py-1 text-sm rounded-full bg-white/10 text-white 
                             backdrop-blur-sm border border-white/20">
                {opus}
              </span>
            )}
            {musicalKey && (
              <span key={`key-${id}`} className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-100 
                             backdrop-blur-sm border border-blue-500/30">
                {musicalKey}
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
            {instrumentOrVoiceType && (
              <div key={`instrument-${id}`} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span>{instrumentOrVoiceType}</span>
              </div>
            )}
            {movementNumber && (
              <div key={`movement-${id}`} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Movement {movementNumber}</span>
              </div>
            )}
            {duration && (
              <div key={`duration-${id}`} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

MusicCard.propTypes = {
  imageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  composerLastName: PropTypes.string.isRequired,
  opus: PropTypes.string,
  musicalKey: PropTypes.string,
  duration: PropTypes.string,
  instrumentOrVoiceType: PropTypes.string,
  movementNumber: PropTypes.number,
  id: PropTypes.string.isRequired,
};

export default MusicCard;
