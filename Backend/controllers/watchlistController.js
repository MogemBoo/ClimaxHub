import pool from "../db.js";

export const getUserWatchlist = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const movieWatchlist = await pool.query(
      `SELECT 
         m.movie_id,
         m.title,
         m.poster_url,
         m.rating,
         m.release_date,
         wm.status,
         'movie' as type
       FROM watchlist_movie wm
       JOIN movie m ON wm.movie_id = m.movie_id
       JOIN watchlist w ON wm.watchlist_id = w.watchlist_id
       WHERE w.user_id = $1`,
      [user_id]
    );

    const seriesWatchlist = await pool.query(
      `SELECT 
         s.series_id,
         s.title,
         s.poster_url,
         s.rating,
         s.start_date as release_date,
         ws.status,
         'series' as type
       FROM watchlist_series ws
       JOIN series s ON ws.series_id = s.series_id
       JOIN watchlist w ON ws.watchlist_id = w.watchlist_id
       WHERE w.user_id = $1`,
      [user_id]
    );

    const allWatchlist = [...movieWatchlist.rows, ...seriesWatchlist.rows];

    res.json(allWatchlist);

  } catch (err) {
    console.error("Error fetching watchlist:", err);
    res.status(500).json({ message: "Error loading watchlist" });
  }
};
