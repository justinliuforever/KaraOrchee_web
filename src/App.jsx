import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import BeatDetectorPage from './pages/BeatDetectorPage';
import EyeBlinkDetectionPage from './pages/EyeBlinkDetectionPage';
import EyeStateDetectionPage from './pages/EyeStateDetectionPage';
import HeadPoseDetectionPage from './pages/HeadPoseDetectionPage'; // Import the new page
import LibraryPage from './pages/LibraryPage';
import MouthStateDetectionPage from './pages/MouthStateDetectionPage';
import MusicPlayerPage from './pages/MusicPlayerPage';

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
        <Route path="/HeadPoseDetectionPage" element={<HeadPoseDetectionPage />} /> {/* Add the new route */}
      </Routes>
    </Router>
  );
}
