import React, { useState } from 'react';

const ScoreDisplay = ({ scoreArray, currentScoreIndex, handleNextScore, handlePreviousScore, handleThumbnailClick }) => {
  const [showThumbnails, setShowThumbnails] = useState(true);

  const handleToggle = () => {
    setShowThumbnails(!showThumbnails);
  };

  return (
    <>
      <div className="relative w-full" data-carousel="slide">
        <div
          className={`relative ${showThumbnails ? 'h-56 md:h-96' : 'h-96 md:h-96'} overflow-hidden rounded-lg flex items-center justify-center`}
          onClick={handleToggle}
          role="button"
          aria-label="Toggle Thumbnails"
        >
          {scoreArray.map((score, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentScoreIndex ? 'opacity-100' : 'opacity-0'}`}
              data-carousel-item={index === currentScoreIndex ? 'active' : ''}
            >
              <img
                src={score}
                className="block max-w-full max-h-full object-contain mx-auto cursor-pointer"
                alt={`Score Page ${index + 1}`}
                aria-hidden={index !== currentScoreIndex}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          onClick={handlePreviousScore}
          aria-label="Previous Score"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1L1 5l4 4"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>
        <button
          type="button"
          className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          onClick={handleNextScore}
          aria-label="Next Score"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 9l4-4-4-4"
              />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
      {showThumbnails ? (
        <div className="grid grid-cols-6 md:grid-cols-8 gap-4 mt-5">
          {scoreArray.map((score, index) => (
            <div key={index}>
              <img
                className={`h-auto max-w-full rounded-lg cursor-pointer ${index === currentScoreIndex ? 'border-2 border-white' : ''}`}
                src={score}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`Thumbnail ${index + 1}`}
              />
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ScoreDisplay;
