import BeatDetector from '../components/BeatDetector';
import React from 'react';

const BeatDetectorPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Beat Detector</h1>
      <BeatDetector />
    </div>
  );
};

export default BeatDetectorPage;
