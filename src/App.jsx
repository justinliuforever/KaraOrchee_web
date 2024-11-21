import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import AudioPlayerWithCV from './pages/AudioPlayerWithCV';
import BeatDetectorPage from './pages/BeatDetectorPage';
import EyeBlinkDetectionPage from './pages/EyeBlinkDetectionPage';
import EyeStateDetectionPage from './pages/EyeStateDetectionPage';
import HeadPoseDetectionPage from './pages/HeadPoseDetectionPage';
import LibraryPage from './pages/LibraryPage';
import MouthStateDetectionPage from './pages/MouthStateDetectionPage';
import MusicPlayerPage from './pages/MusicPlayerPage';
import VerifySubscriptionPage from './pages/VerifySubscriptionPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/about" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/Library" element={<LibraryPage />} />
        <Route path="/Library/:id" element={<MusicPlayerPage />} />
        <Route path="/BeatDetectorPage" element={<BeatDetectorPage />} />
        <Route path="/MouthStateDetectionPage" element={<MouthStateDetectionPage />} />
        <Route path="/EyeStateDetectionPage" element={<EyeStateDetectionPage />} />
        <Route path="/EyeBlinkDetectionPage" element={<EyeBlinkDetectionPage />} />
        <Route path="/HeadPoseDetectionPage" element={<HeadPoseDetectionPage />} />
        <Route path="/AudioPlayerWithCV" element={<AudioPlayerWithCV />} />
        <Route path="/verify-subscription/:token" element={<VerifySubscriptionPage />} />
      </Routes>
    </Router>
  );
}
