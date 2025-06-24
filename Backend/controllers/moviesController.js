import pool from '../db.js';

export async function addFullMovie(req, res) {
  const {
    title, release_date, duration, description,
    rating, vote_count, poster_url, trailer_url,
    genres, cast, crew
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert movie
    const movieResult = await client.query(`
      INSERT INTO movie (title, release_date, duration, description, rating, vote_count, poster_url, trailer_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING movie_id
    `, [title, release_date, duration, description, rating, vote_count, poster_url, trailer_url]);

    const movieId = movieResult.rows[0].movie_id;

    // Insert genres
    for (const genreName of genres || []) {
      let genreRes = await client.query(`SELECT genre_id FROM genre WHERE name=$1`, [genreName]);
      let genreId;

      if (genreRes.rowCount === 0) {
        genreRes = await client.query(`INSERT INTO genre(name) VALUES($1) RETURNING genre_id`, [genreName]);
      }
      genreId = genreRes.rows[0].genre_id;

      await client.query(`INSERT INTO movie_genre(movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [movieId, genreId]);
    }

    // Insert cast
    for (const person of cast || []) {
      const { name, birthdate, bio, profile_img_url, popularity, character_name } = person;

      let personRes = await client.query(`SELECT person_id FROM person WHERE name=$1`, [name]);
      let personId;

      if (personRes.rowCount === 0) {
        personRes = await client.query(`
          INSERT INTO person(name, birthdate, bio, profile_img_url, popularity)
          VALUES($1, $2, $3, $4, $5) RETURNING person_id
        `, [name, birthdate, bio, profile_img_url, popularity]);
      }
      personId = personRes.rows[0].person_id;

      await client.query(`
        INSERT INTO movie_cast(movie_id, person_id, character_name)
        VALUES($1, $2, $3) ON CONFLICT DO NOTHING
      `, [movieId, personId, character_name]);
    }

    // Insert crew
    for (const person of crew || []) {
      const { name, birthdate, bio, profile_img_url, popularity, role } = person;

      let personRes = await client.query(`SELECT person_id FROM person WHERE name=$1`, [name]);
      let personId;

      if (personRes.rowCount === 0) {
        personRes = await client.query(`
          INSERT INTO person(name, birthdate, bio, profile_img_url, popularity)
          VALUES($1, $2, $3, $4, $5) RETURNING person_id
        `, [name, birthdate, bio, profile_img_url, popularity]);
      }
      personId = personRes.rows[0].person_id;

      await client.query(`
        INSERT INTO movie_crew(movie_id, person_id, role)
        VALUES($1, $2, $3) ON CONFLICT DO NOTHING
      `, [movieId, personId, role]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Movie, cast, crew, and genres added!', movie_id: movieId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Insert error:', err);
    res.status(500).json({ error: 'Failed to insert movie data' });
  } finally {
    client.release();
  }
}
