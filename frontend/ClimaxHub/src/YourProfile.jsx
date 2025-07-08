import React, { useEffect, useState } from "react";
import "./YourProfile.css";

const YourProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      fetch(`http://localhost:5000/api/users/${parsed.user_id}`)
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error("Error loading user profile", err));
    }
  }, []);

  if (!user) return <div className="profile-loader">Loading Profile...</div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">{user.username}'s Profile</h1>
      <p className="profile-joined">Joined: {new Date(user.joined_at).toLocaleDateString()}</p>

      <div className="profile-section">
        <h2>Your Ratings</h2>
        {user.ratings?.length ? (
          <ul className="profile-list">
            {user.ratings.map((r, i) => (
              <li key={i}>
                ⭐ {r.score}/10 — <strong>{r.title}</strong> ({r.type})
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">You haven’t rated anything yet.</p>
        )}
      </div>

      <div className="profile-section">
        <h2>Your Watchlist</h2>
        {user.watchlist?.length ? (
          <ul className="profile-list">
            {user.watchlist.map((item, i) => (
              <li key={i}>
                📌 {item.title} ({item.type})
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">Your watchlist is empty.</p>
        )}
      </div>

      <div className="profile-section">
        <h2>Your Reviews</h2>
        {user.reviews?.length ? (
          <ul className="profile-list">
            {user.reviews.map((rev, i) => (
              <li key={i}>
                <strong>{rev.title}</strong> — {rev.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">You haven’t written any reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default YourProfile;
