import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './index.css';
import HomePage from './Home.jsx';
import TopMovies from './TopMovie.jsx';
import GetAll from './GetAll.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/top-movies" element={<TopMovies />} />
        <Route path="/get-all" element={<GetAll />} />
      </Routes>
    </Router>
  </StrictMode>
);
