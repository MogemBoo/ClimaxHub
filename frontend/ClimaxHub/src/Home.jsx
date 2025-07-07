import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

let debounceTimer = null;

const HomePage = () => {
  const navigate = useNavigate();
  const [topMovies, setTopMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentSeries, setRecentSeries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

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

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    debounceTimer = setTimeout(() => {
      fetch(`http://localhost:5000/api/movies/search?query=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch((err) => {
          console.error("Error searching:", err);
          setSearchResults([]);
        });
    }, 400);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/movies/search?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data))
      .catch((err) => console.error("Error searching movies:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowLogout(false);
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
      <h1 className="homepage-title">Welcome to ClimaxHub</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search Movies and Series..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>

        <button
          type="button"
          className="top-movies-btn"
          onClick={() => navigate("/top-movies")}
        >
          Top Movies
        </button>

        {!user ? (
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="login-btn"
              onClick={() => setShowLogout(!showLogout)}
            >
              {user.username}
            </button>
            {showLogout && (
              <button
                type="button"
                className="login-btn"
                onClick={handleLogout}
                style={{ marginLeft: "10px", backgroundColor: "#c0392b", borderColor: "#c0392b" }}
              >
                Logout
              </button>
            )}
          </div>
        )}
      </form>

      {searchQuery.trim() !== "" && (
        <div className="section">
          <h2 className="section-title">Search Results</h2>
          {searchResults.length > 0 ? (
            <MovieList movies={searchResults} onCardClick={handleCardClick} />
          ) : (
            <p style={{ color: "#bbb", marginTop: "1rem" }}>No results found.</p>
          )}
        </div>
      )}

      <Section title="Top Rated Movies" data={topMovies} scrollRef={topScrollRef} onCardClick={handleCardClick} />
      <Section title="Recently Released Movies" data={recentMovies} scrollRef={recentMovieScrollRef} onCardClick={handleCardClick} />
      <Section title="Recently Released Series" data={recentSeries} scrollRef={recentSeriesScrollRef} onCardClick={handleCardClick} isSeries />
    </div>
  );
};

const Section = ({ title, data, scrollRef, onCardClick, isSeries = false }) => (
  <div className="section">
    <h2 className="section-title">{title}</h2>
    <div className="scroll-container">
      <button className="scroll-arrow left" onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}>←</button>
      {isSeries ? (
        <SeriesList series={data} scrollRef={scrollRef} onCardClick={onCardClick} />
      ) : (
        <MovieList movies={data} scrollRef={scrollRef} onCardClick={onCardClick} />
      )}
      <button className="scroll-arrow right" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>→</button>
    </div>
  </div>
);

const MovieList = ({ movies, scrollRef, onCardClick }) => (
  <div className="movie-horizontal-scroll" ref={scrollRef}>
    {movies.map((movie) => (
      <div
        key={movie.movie_id}
        className="movie-scroll-card"
        onClick={() => onCardClick("movies", movie.movie_id)}
      >
        <img src={movie.poster_url} alt={movie.title} className="movie-scroll-poster" />
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
      >
        <img src={s.poster_url} alt={s.title} className="movie-scroll-poster" />
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
