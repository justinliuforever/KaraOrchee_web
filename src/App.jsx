import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import BeatDetectorPage from './pages/BeatDetectorPage';
import EyeBlinkDetectionPage from './pages/EyeBlinkDetectionPage';
import EyeStateDetectionPage from './pages/EyeStateDetectionPage';
import LibraryPage from './pages/LibraryPage';
import MouthStateDetectionPage from './pages/MouthStateDetectionPage';
import MusicPlayerPage from './pages/MusicPlayerPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<MainPage />} /> */}
        <Route path="/" element={<Navigate to="/about" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/Library" element={<LibraryPage />} />
        <Route path="/Library/:id" element={<MusicPlayerPage />} />
        <Route path="/BeatDetectorPage" element={<BeatDetectorPage />} />
        <Route path="/MouthStateDetectionPage" element={<MouthStateDetectionPage />} />
        <Route path="/EyeStateDetectionPage" element={<EyeStateDetectionPage />} />
        <Route path="/EyeBlinkDetectionPage" element={<EyeBlinkDetectionPage />} />
      </Routes>
    </Router>
  );
}
