import pool from './db.js';

// Helpers (you can import from a helpers folder)
async function getOrCreateGenre(name) {
  const res = await pool.query('SELECT genre_id FROM genre WHERE name = $1', [name]);
  if (res.rows.length) return res.rows[0].genre_id;

  const insert = await pool.query(
    'INSERT INTO genre (name) VALUES ($1) RETURNING genre_id',
    [name]
  );
  return insert.rows[0].genre_id;
}

async function getOrCreatePerson({ name, birthdate, bio, profile_img_url, popularity }) {
  const res = await pool.query('SELECT person_id FROM person WHERE name = $1', [name]);
  if (res.rows.length) return res.rows[0].person_id;

  const insert = await pool.query(
    `INSERT INTO person (name, birthdate, bio, profile_img_url, popularity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING person_id`,
    [name, birthdate, bio, profile_img_url, popularity]
  );
  return insert.rows[0].person_id;
}

// Movie data
const movies = [
  {
    title: 'Spirited Away',
    release_date: '2001-07-20',
    duration: 125,
    description: 'A girl ventures into a magical spirit world.',
    rating: 8.6,
    vote_count: 150000,
    poster_url: '',
    trailer_url: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    cast: [
      { name: 'Rumi Hiiragi', character_name: 'Chihiro/Sen', birthdate: '1987-08-01', bio: 'Japanese actress.', profile_img_url: '', popularity: 75 },
      { name: 'Miyu Irino', character_name: 'Haku', birthdate: '1988-02-19', bio: 'Japanese actor.', profile_img_url: '', popularity: 80 }
    ],
    crew: [
      { name: 'Hayao Miyazaki', role: 'Director', birthdate: '1941-01-05', bio: 'Japanese animator and director.', profile_img_url: '', popularity: 100 }
    ]
  },
  {
    title: 'Interstellar',
    release_date: '2014-11-07',
    duration: 169,
    description: 'A team travels through space in search of a new home for humanity.',
    rating: 8.6,
    vote_count: 1500000,
    poster_url: '',
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    cast: [
      { name: 'Matthew McConaughey', character_name: 'Cooper', birthdate: null, bio: 'American actor.', profile_img_url: '', popularity: 95 },
      { name: 'Anne Hathaway', character_name: 'Dr. Brand', birthdate: null, bio: 'American actress.', profile_img_url: '', popularity: 95 },
      { name: 'Jessica Chastain', character_name: 'Murph', birthdate: null, bio: 'American actress.', profile_img_url: '', popularity: 92 },
      { name: 'Michael Caine', character_name: 'Professor Brand', birthdate: null, bio: 'English actor.', profile_img_url: '', popularity: 93 }
    ],
    crew: [
      { name: 'Christopher Nolan', role: 'Director', birthdate: '1970-07-30', bio: 'British-American filmmaker.', profile_img_url: '', popularity: 99 }
    ]
  }
];

async function seedMovies() {
  for (const movie of movies) {
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert movie
      const movieRes = await client.query(
        `INSERT INTO movie
         (title, release_date, duration, description, rating, vote_count, poster_url, trailer_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING movie_id`,
        [
          movie.title,
          movie.release_date,
          movie.duration,
          movie.description,
          movie.rating,
          movie.vote_count,
          movie.poster_url,
          movie.trailer_url
        ]
      );
      const movieId = movieRes.rows[0].movie_id;

      // Link genres
      for (const name of movie.genres) {
        const genreId = await getOrCreateGenre(name);
        await client.query(
          'INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [movieId, genreId]
        );
      }

      // Link cast
      for (const actor of movie.cast) {
        const personId = await getOrCreatePerson(actor);
        await client.query(
          'INSERT INTO movie_cast (movie_id, person_id, character_name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [movieId, personId, actor.character_name]
        );
      }

      // Link crew
      for (const member of movie.crew) {
        const personId = await getOrCreatePerson(member);
        await client.query(
          'INSERT INTO movie_crew (movie_id, person_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [movieId, personId, member.role]
        );
      }

      await client.query('COMMIT');
      console.log(`✅ Inserted movie: ${movie.title}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to insert ${movie.title}:`, err);
    } finally {
      client.release();
    }
  }

  console.log('All movies seeded.');
  process.exit(0);
}

seedMovies();
