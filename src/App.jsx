import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import BeatDetectorPage from './pages/BeatDetectorPage';
import HeadPoseDetectionPage from './pages/HeadPoseDetectionPage';
import LibraryPage from './pages/LibraryPage';
import MouthStateDetectionPage from './pages/MouthStateDetectionPage';
import MusicDetailPage from './pages/MusicDetailPage';
import VerifySubscriptionPage from './pages/VerifySubscriptionPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/about" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/Library" element={<LibraryPage />} />
        <Route path="/Library/:id" element={<MusicDetailPage />} />
        <Route path="/BeatDetectorPage" element={<BeatDetectorPage />} />
        <Route path="/MouthStateDetectionPage" element={<MouthStateDetectionPage />} />
        <Route path="/HeadPoseDetectionPage" element={<HeadPoseDetectionPage />} />
        <Route path="/verify-subscription/:token" element={<VerifySubscriptionPage />} />
      </Routes>
    </Router>
  );
}
