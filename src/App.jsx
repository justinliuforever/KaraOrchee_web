import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import MainPage from './pages/MainPage';
import TestPage from './pages/TestPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/test" element={<TestPage/>} />

      </Routes>
    </Router>
  );
}
