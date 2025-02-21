import MusicCard from './MusicCard';
import PropTypes from 'prop-types';

const RestrictedMusicCard = ({ 
  isLocked, 
  coverImageUrl,
  _id,
  id,
  ...musicCardProps 
}) => {
  const mappedProps = {
    ...musicCardProps,
    imageUrl: coverImageUrl,
    id: id || _id,
  };

  if (!isLocked) {
    return <MusicCard {...mappedProps} />;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-2xl 
                    flex flex-col items-center justify-center text-white">
        <svg 
          className="w-12 h-12 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
        <p className="text-lg font-semibold mb-2">Premium Content</p>
        <p className="text-sm text-gray-300 text-center px-4">
          Please sign in to access full library
        </p>
      </div>
      <div className="pointer-events-none">
        <MusicCard {...mappedProps} />
      </div>
    </div>
  );
};

RestrictedMusicCard.propTypes = {
  isLocked: PropTypes.bool.isRequired,
  coverImageUrl: PropTypes.string,
  _id: PropTypes.string.isRequired,
  id: PropTypes.string,
  ...MusicCard.propTypes
};

export default RestrictedMusicCard; 
