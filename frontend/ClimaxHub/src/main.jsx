import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import HomePage from './Home.jsx'
import GetAll from './GetAll.jsx'
import TopMovies from './TopMovie.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TopMovies />
  </StrictMode>,
)
