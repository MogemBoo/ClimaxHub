import pool from '../db.js';

export async function addFullSeries(req, res) {
  const {
    title,
    start_date,
    end_date,
    description,
    rating,
    vote_count,
    poster_url,
    trailer_url,
    genres,
    cast,
    crew,
    seasons
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert series
    const seriesResult = await client.query(`
      INSERT INTO series (title, start_date, end_date, description, rating, vote_count, poster_url, trailer_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING series_id
    `, [title, start_date, end_date, description, rating, vote_count, poster_url, trailer_url]);

    const seriesId = seriesResult.rows[0].series_id;

    // Insert genres
    for (const genreName of genres || []) {
      let genreRes = await client.query(`SELECT genre_id FROM genre WHERE name=$1`, [genreName]);
      if (genreRes.rowCount === 0) {
        genreRes = await client.query(`INSERT INTO genre(name) VALUES($1) RETURNING genre_id`, [genreName]);
      }
      const genreId = genreRes.rows[0].genre_id;
      await client.query(`INSERT INTO series_genre(series_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [seriesId, genreId]);
    }

    // Insert cast
    for (const person of cast || []) {
      const { name, birthdate, bio, profile_img_url, popularity, character_name } = person;
      let personRes = await client.query(`SELECT person_id FROM person WHERE name=$1`, [name]);
      if (personRes.rowCount === 0) {
        personRes = await client.query(`
          INSERT INTO person(name, birthdate, bio, profile_img_url, popularity)
          VALUES($1, $2, $3, $4, $5) RETURNING person_id
        `, [name, birthdate, bio, profile_img_url, popularity]);
      }
      const personId = personRes.rows[0].person_id;
      await client.query(`
        INSERT INTO series_cast(series_id, person_id, character_name)
        VALUES($1, $2, $3) ON CONFLICT DO NOTHING
      `, [seriesId, personId, character_name]);
    }

    // Insert crew
    for (const person of crew || []) {
      const { name, birthdate, bio, profile_img_url, popularity, role } = person;
      let personRes = await client.query(`SELECT person_id FROM person WHERE name=$1`, [name]);
      if (personRes.rowCount === 0) {
        personRes = await client.query(`
          INSERT INTO person(name, birthdate, bio, profile_img_url, popularity)
          VALUES($1, $2, $3, $4, $5) RETURNING person_id
        `, [name, birthdate, bio, profile_img_url, popularity]);
      }
      const personId = personRes.rows[0].person_id;
      await client.query(`
        INSERT INTO series_crew(series_id, person_id, role)
        VALUES($1, $2, $3) ON CONFLICT DO NOTHING
      `, [seriesId, personId, role]);
    }

    // Insert seasons and episodes
    for (const season of seasons || []) {
      const { season_number, release_date, description, trailer_url, episodes } = season;

      const seasonResult = await client.query(`
        INSERT INTO season (series_id, season_number, release_date, description, trailer_url)
        VALUES ($1, $2, $3, $4, $5) RETURNING season_id
      `, [seriesId, season_number, release_date, description, trailer_url]);

      const seasonId = seasonResult.rows[0].season_id;

      for (const ep of episodes || []) {
        const { episode_number, title, air_date, duration, description } = ep;
        await client.query(`
          INSERT INTO episode (season_id, episode_number, title, air_date, duration, description)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [seasonId, episode_number, title, air_date, duration, description]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: ' Series, cast, crew, genres, seasons, and episodes added!', series_id: seriesId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(' Insert error:', err);
    res.status(500).json({ error: 'Failed to insert series data' });
  } finally {
    client.release();
  }
}

export async function getSeriesById(req, res) {
  const seriesId = req.params.id;

  try {
    const seriesResult = await pool.query(`
      SELECT series_id, title, start_date, end_date, description, rating, vote_count, poster_url, trailer_url
      FROM series
      WHERE series_id = $1
    `, [seriesId]);

    if (seriesResult.rowCount === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const series = seriesResult.rows[0];

    const genresResult = await pool.query(`
      SELECT g.name FROM genre g
      JOIN series_genre sg ON g.genre_id = sg.genre_id
      WHERE sg.series_id = $1
    `, [seriesId]);

    const castResult = await pool.query(`
      SELECT p.person_id, p.name, p.birthdate, p.bio, p.profile_img_url, p.popularity, sc.character_name
      FROM person p
      JOIN series_cast sc ON p.person_id = sc.person_id
      WHERE sc.series_id = $1
    `, [seriesId]);

    const crewResult = await pool.query(`
      SELECT p.person_id, p.name, p.birthdate, p.bio, p.profile_img_url, p.popularity, sc.role
      FROM person p
      JOIN series_crew sc ON p.person_id = sc.person_id
      WHERE sc.series_id = $1
    `, [seriesId]);

    const seasonsResult = await pool.query(`
      SELECT season_id, season_number, release_date, description, trailer_url
      FROM season
      WHERE series_id = $1
      ORDER BY season_number
    `, [seriesId]);

    for (const season of seasonsResult.rows) {
      const episodesResult = await pool.query(`
        SELECT episode_id, episode_number, title, air_date, duration, description
        FROM episode
        WHERE season_id = $1
        ORDER BY episode_number
      `, [season.season_id]);

      season.episodes = episodesResult.rows;
    }

    const reviewsResult = await pool.query(`
  SELECT r.review_id, r.rating, r.comments, r.created_at, p.username AS reviewer_name
  FROM series_review r
  JOIN users p ON r.user_id = p.user_id
  WHERE r.series_id = $1
  ORDER BY r.created_at DESC
`, [seriesId]);


    res.json({
      ...series,
      genres: genresResult.rows.map(g => g.name),
      cast: castResult.rows,
      crew: crewResult.rows,
      seasons: seasonsResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching series by ID:', error);
    res.status(500).json({ error: 'Failed to fetch series details' });
  }
}


//top rated
export async function getTopRatedSeries(req, res) {
  try {
    const result = await pool.query(`
      SELECT series_id, title, rating, vote_count, poster_url, description
      FROM series
      WHERE rating IS NOT NULL
      ORDER BY rating DESC, vote_count DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top-rated series:', error);
    res.status(500).json({ error: 'Failed to fetch top-rated series' });
  }
}


// search
export async function searchSeries(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  try {
    const result = await pool.query(`
      SELECT series_id, title, rating, start_date, poster_url
      FROM series
      WHERE LOWER(title) LIKE LOWER($1)
      ORDER BY start_date DESC
      LIMIT 20
    `, [`%${query}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error(' Error searching series:', error);
    res.status(500).json({ error: 'Failed to search series' });
  }
}


//recent
export async function getRecentSeries(req, res) {
  try {
    const result = await pool.query(`
      SELECT series_id, title, start_date, rating, poster_url
      FROM series
      ORDER BY start_date DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(' Error fetching recent series:', error);
    res.status(500).json({ error: 'Failed to fetch recent series' });
  }
}


//get all
export async function getAllSeries(req, res) {
  try {
    const result = await pool.query(`
      SELECT series_id, title, start_date, rating, poster_url
      FROM series
      ORDER BY title DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(' Error fetching all series:', error);
    res.status(500).json({ error: 'Failed to fetch all series' });
  }
}

export async function getSeriesEpisodes(req, res) {
  const seriesId = req.params.id;

  try {
    // Get all seasons for the series
    const seasonsResult = await pool.query(`
      SELECT season_id, season_number
      FROM season
      WHERE series_id = $1
      ORDER BY season_number
    `, [seriesId]);

    // For each season, get episodes
    const episodesBySeason = {};

    for (const season of seasonsResult.rows) {
      const episodesResult = await pool.query(`
        SELECT episode_id, episode_number, title, air_date, duration, description
        FROM episode
        WHERE season_id = $1
        ORDER BY episode_number
      `, [season.season_id]);

      episodesBySeason[season.season_number] = episodesResult.rows;
    }

    // Flatten episodes into one array with a 'season' field for frontend convenience
    const allEpisodes = [];
    for (const [seasonNum, episodes] of Object.entries(episodesBySeason)) {
      episodes.forEach(ep => ep.season = parseInt(seasonNum));
      allEpisodes.push(...episodes);
    }

    res.json(allEpisodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
}

// per star user count
export const getPerStarUserCount = async (req, res) => {
  const { id } = req.params;

  const series_id = parseInt(id);
  if (isNaN(series_id)) {
    return res.status(400).json({ error: 'Invalid series ID' });
  }

  try {
    const result = await pool.query(`
      SELECT rating, COUNT(DISTINCT user_id) AS count
      FROM series_review
      WHERE series_id = $1
      GROUP BY rating
      ORDER BY rating ASC
    `, [series_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error while fetching per star user count:', error);
    res.status(500).json({ error: 'Failed to fetch per star user count' });
  }
}