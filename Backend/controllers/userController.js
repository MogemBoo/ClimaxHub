import pool from "../db.js";

export const getUserProfile = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    // Get basic user info (use created_at instead of joined_at)
    const userResult = await pool.query(
      `SELECT username, created_at FROM users WHERE user_id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Get ratings (movies + series combined)
    const movieRatings = await pool.query(
      `SELECT m.title, mr.rating as score, 'movie' as type
       FROM movie_review mr
       JOIN movie m ON mr.movie_id = m.movie_id
       WHERE mr.user_id = $1`,
      [user_id]
    );

    const seriesRatings = await pool.query(
      `SELECT s.title, sr.rating as score, 'series' as type
       FROM series_review sr
       JOIN series s ON sr.series_id = s.series_id
       WHERE sr.user_id = $1`,
      [user_id]
    );

    const allRatings = [...movieRatings.rows, ...seriesRatings.rows];

    // Watchlist and reviews placeholders for now
    const watchlist = [];
    const reviews = [];

    res.json({
      username: user.username,
      created_at: user.created_at,
      ratings: allRatings,
      watchlist,
      reviews,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading user profile" });
  }
};
