import pool from "../db.js";

export const getUserProfile = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    // Get user basic info
    const userResult = await pool.query(
      `SELECT username, created_at FROM users WHERE user_id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Get movie ratings with poster URL and movie_id
    const movieRatings = await pool.query(
      `SELECT 
         m.movie_id,
         m.title,
         m.poster_url,
         mr.rating as score,
         'movie' as type
       FROM movie_review mr
       JOIN movie m ON mr.movie_id = m.movie_id
       WHERE mr.user_id = $1`,
      [user_id]
    );

    // Get series ratings with poster URL and series_id
    const seriesRatings = await pool.query(
      `SELECT 
         s.series_id,
         s.title,
         s.poster_url,
         sr.rating as score,
         'series' as type
       FROM series_review sr
       JOIN series s ON sr.series_id = s.series_id
       WHERE sr.user_id = $1`,
      [user_id]
    );

    // Merge ratings
    const allRatings = [...movieRatings.rows, ...seriesRatings.rows];

    // Get movie watchlist
    const movieWatchlist = await pool.query(
      `SELECT 
         m.movie_id,
         m.title,
         m.poster_url,
         'movie' as type,
         wm.status
       FROM watchlist_movie wm
       JOIN movie m ON wm.movie_id = m.movie_id
       WHERE wm.watchlist_id = (
         SELECT watchlist_id FROM watchlist WHERE user_id = $1
       )`,
      [user_id]
    );

    // Get series watchlist
    const seriesWatchlist = await pool.query(
      `SELECT 
         s.series_id,
         s.title,
         s.poster_url,
         'series' as type,
         ws.status
       FROM watchlist_series ws
       JOIN series s ON ws.series_id = s.series_id
       WHERE ws.watchlist_id = (
         SELECT watchlist_id FROM watchlist WHERE user_id = $1
       )`,
      [user_id]
    );

    const allWatchlist = [...movieWatchlist.rows, ...seriesWatchlist.rows];

    //reviews placeholders (you can update later)
    const reviews = [];
    const posts = []; // For your posts section

    res.json({
      username: user.username,
      created_at: user.created_at,
      ratings: allRatings,
      watchlist: allWatchlist,
      reviews,
      posts,
    });

  } catch (err) {
    console.error("Error loading user profile:", err);
    res.status(500).json({ message: "Error loading user profile" });
  }
};
