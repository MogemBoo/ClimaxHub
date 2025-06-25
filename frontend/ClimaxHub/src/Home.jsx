import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

const HomePage = () => {
  const navigate = useNavigate(); 
  const [topMovies, setTopMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentSeries, setRecentSeries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const topScrollRef = useRef(null);
  const recentMovieScrollRef = useRef(null);
  const recentSeriesScrollRef = useRef(null);  

  useEffect(() => {
    fetch("http://localhost:5000/api/movies/top")
      .then((res) => res.json())
      .then((data) => setTopMovies(data))
      .catch((err) => console.error("Error fetching top movies:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/movies/recent")
      .then((res) => res.json())
      .then((data) => setRecentMovies(data))
      .catch((err) => console.error("Error fetching recent movies:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/series/recent")  
      .then((res) => res.json())
      .then((data) => setRecentSeries(data))
      .catch((err) => console.error("Error fetching recent series:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/movies/search?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data))
      .catch((err) => console.error("Error searching movies:", err));
  };

  const scroll = (ref, direction) => {
    if (!ref.current) return;
    const scrollAmount = 300;
    ref.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCardClick = (type, id) => {
    navigate(`/details/${type}/${id}`);
  };

  return (
    <div className="homepage-container">
      <button
        className="top-movies-btn"
        onClick={() => navigate("/top-movies")}
        aria-label="Go to Top Movies page"
      >
        Top Movies
      </button>
      <h1 className="homepage-title">Welcome to ClimaxHub</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="section">
          <h2 className="section-title">Search Results</h2>
          <MovieList movies={searchResults} onCardClick={handleCardClick} />
        </div>
      )}

      <div className="section">
        <h2 className="section-title"> Top Rated Movies</h2>
        <div className="scroll-container">
          <button
            className="scroll-arrow left"
            onClick={() => scroll(topScrollRef, "left")}
          >
            ←
          </button>
          <MovieList movies={topMovies} scrollRef={topScrollRef} onCardClick={handleCardClick} />
          <button
            className="scroll-arrow right"
            onClick={() => scroll(topScrollRef, "right")}
          >
            →
          </button>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title"> Recently Released Movies</h2>
        <div className="scroll-container">
          <button
            className="scroll-arrow left"
            onClick={() => scroll(recentMovieScrollRef, "left")}
          >
            ←
          </button>
          <MovieList movies={recentMovies} scrollRef={recentMovieScrollRef} onCardClick={handleCardClick} />
          <button
            className="scroll-arrow right"
            onClick={() => scroll(recentMovieScrollRef, "right")}
          >
            →
          </button>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title"> Recently Released Series</h2>
        <div className="scroll-container">
          <button
            className="scroll-arrow left"
            onClick={() => scroll(recentSeriesScrollRef, "left")}
          >
            ←
          </button>
          <SeriesList series={recentSeries} scrollRef={recentSeriesScrollRef} onCardClick={handleCardClick} />
          <button
            className="scroll-arrow right"
            onClick={() => scroll(recentSeriesScrollRef, "right")}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

const MovieList = ({ movies, scrollRef, onCardClick }) => (
  <div className="movie-horizontal-scroll" ref={scrollRef}>
    {movies.map((movie) => (
      <div
        key={movie.movie_id}
        className="movie-scroll-card"
        onClick={() => onCardClick("movies", movie.movie_id)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="movie-scroll-poster"
        />
        <div>
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-info">Rating: {movie.rating}</p>
          <p className="movie-info">Released: {movie.release_date}</p>
        </div>
      </div>
    ))}
  </div>
);

const SeriesList = ({ series, scrollRef, onCardClick }) => (
  <div className="movie-horizontal-scroll" ref={scrollRef}>
    {series.map((s) => (
      <div
        key={s.series_id}
        className="movie-scroll-card"
        onClick={() => onCardClick("series", s.series_id)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={s.poster_url}
          alt={s.title}
          className="movie-scroll-poster"
        />
        <div>
          <h3 className="movie-title">{s.title}</h3>
          <p className="movie-info">Rating: {s.rating}</p>
          <p className="movie-info">Start Date: {s.start_date}</p>
        </div>
      </div>
    ))}
  </div>
);

export default HomePage;
