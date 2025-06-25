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
      LIMIT 8
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
