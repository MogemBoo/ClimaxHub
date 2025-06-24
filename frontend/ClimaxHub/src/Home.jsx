import React, { useEffect, useState } from "react";

const HomePage = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Fetch top rated movies
  useEffect(() => {
    fetch("http://localhost:5000/api/movies/top")
      .then((res) => res.json())
      .then((data) => setTopMovies(data))
      .catch((err) => console.error("Error fetching top movies:", err));
  }, []);

  // Fetch recently released movies
  useEffect(() => {
    fetch("http://localhost:5000/api/movies/recent")
      .then((res) => res.json())
      .then((data) => setRecentMovies(data))
      .catch((err) => console.error("Error fetching recent movies:", err));
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/movies/search?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data))
      .catch((err) => console.error("Error searching movies:", err));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 ClimaxHub - IMDb Clone</h1>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-64 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Search Results</h2>
          <MovieGrid movies={searchResults} />
        </div>
      )}

      {/* Top Rated Movies */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">⭐ Top Rated Movies</h2>
        <MovieGrid movies={topMovies} />
      </div>

      {/* Recently Released Movies */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">🆕 Recently Released Movies</h2>
        <MovieGrid movies={recentMovies} />
      </div>
    </div>
  );
};

const MovieGrid = ({ movies }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {movies.map((movie) => (
      <div key={movie.movie_id} className="border rounded shadow p-2">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-64 object-cover mb-2"
        />
        <h3 className="font-bold text-lg">{movie.title}</h3>
        <p>Rating: ⭐ {movie.rating}</p>
        <p>Released: {movie.release_date}</p>
      </div>
    ))}
  </div>
);

export default HomePage;
