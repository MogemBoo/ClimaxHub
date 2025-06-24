import React, { useEffect, useState, useRef } from "react";
import "./Home.css"; // import the CSS file

const HomePage = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const topScrollRef = useRef(null);
  const recentScrollRef = useRef(null);

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

  return (
    <div className="homepage-container">
      <h1 className="homepage-title">🎬 ClimaxHub - IMDb Clone</h1>

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
          <MovieList movies={searchResults} />
        </div>
      )}

      <div className="section">
        <h2 className="section-title">⭐ Top Rated Movies</h2>
        <div className="scroll-container">
          <button className="scroll-arrow left" onClick={() => scroll(topScrollRef, "left")}>←</button>
          <MovieList movies={topMovies} scrollRef={topScrollRef} />
          <button className="scroll-arrow right" onClick={() => scroll(topScrollRef, "right")}>→</button>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">🆕 Recently Released Movies</h2>
        <div className="scroll-container">
          <button className="scroll-arrow left" onClick={() => scroll(recentScrollRef, "left")}>←</button>
          <MovieList movies={recentMovies} scrollRef={recentScrollRef} />
          <button className="scroll-arrow right" onClick={() => scroll(recentScrollRef, "right")}>→</button>
        </div>
      </div>
    </div>
  );
};

const MovieList = ({ movies, scrollRef }) => (
  <div className="movie-horizontal-scroll" ref={scrollRef}>
    {movies.map((movie) => (
      <div key={movie.movie_id} className="movie-scroll-card">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="movie-scroll-poster"
        />
        <div>
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-info">Rating: ⭐ {movie.rating}</p>
          <p className="movie-info">Released: {movie.release_date}</p>
        </div>
      </div>
    ))}
  </div>
);

export default HomePage;
