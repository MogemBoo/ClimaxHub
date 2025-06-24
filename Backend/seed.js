import pool from './db.js';
import { getOrCreateGenre } from './helpers/genreHelper.js';
import { getOrCreatePerson } from './helpers/personHelper.js';
import { linkCast } from './helpers/castHelper.js';
import { linkCrew } from './helpers/crewHelper.js';
import movies from './seed_data/movies.json' assert { type: 'json' };
import genres from './seed_data/genres.json' assert { type: 'json' };
import people from './seed_data/people.json' assert { type: 'json' };

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Seed genres
    for (const name of genres) {
      await getOrCreateGenre(name);
    }

    // Seed people
    for (const person of people) {
      await getOrCreatePerson(person);
    }

    // Seed movies with full logic
    for (const movie of movies) {
      const {
        title, release_date, duration, description, rating, vote_count, poster_url, trailer_url
      } = movie;

      const movieRes = await pool.query(
        `INSERT INTO movie (title, release_date, duration, description, rating, vote_count, poster_url, trailer_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING movie_id`,
        [title, release_date, duration, description, rating, vote_count, poster_url, trailer_url]
      );
      const movieId = movieRes.rows[0].movie_id;

      // Genres
      for (const genreName of movie.genres) {
        const genreId = await getOrCreateGenre(genreName);
        await pool.query('INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)', [movieId, genreId]);
      }

      // Cast
      for (const actor of movie.cast) {
        const personId = await getOrCreatePerson(actor);
        await linkCast(movieId, personId, actor.character_name);
      }

      // Crew
      for (const crewMember of movie.crew) {
        const personId = await getOrCreatePerson(crewMember);
        await linkCrew(movieId, personId, crewMember.role);
      }
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
