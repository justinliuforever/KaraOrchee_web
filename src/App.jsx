import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import BeatDetectorPage from './pages/BeatDetectorPage';
import EyeStateDetectionPage from './pages/EyeStateDetectionPage';
import FaceDetectionPage from './pages/FaceDetectionPage';
import LibraryPage from './pages/LibraryPage';
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
        <Route path="/FaceDetectionPage" element={<FaceDetectionPage />} />
        <Route path="/EyeStateDetectionPage" element={<EyeStateDetectionPage />} />
      </Routes>
    </Router>
  );
}
