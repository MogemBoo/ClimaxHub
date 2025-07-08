import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./YourWatchlist.css";

const YourWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/watchlist/${user.username}`)
      .then((res) => res.json())
      .then((data) => setWatchlist(data))
      .catch((err) => {
        console.error("Failed to fetch watchlist:", err);
        setWatchlist([]);
      });
  }, [navigate]);

  return (
    <div className="watchlist-container">
      <h1 className="watchlist-title">Your Watchlist</h1>
      {watchlist.length === 0 ? (
        <p className="watchlist-empty">Your watchlist is empty.</p>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((movie) => (
            <div
              key={movie.movie_id}
              className="watchlist-card"
              onClick={() => navigate(`/details/movies/${movie.movie_id}`)}
            >
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="watchlist-poster"
              />
              <div className="watchlist-info">
                <h3>{movie.title}</h3>
                <p>Rating: {movie.rating}</p>
                <p>Release: {movie.release_date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourWatchlist;
