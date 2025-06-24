// seed_people.js
import pool from './db.js';

const people = [
  // Spirited Away cast & crew
  {
    name: 'Hayao Miyazaki',
    birthdate: '1941-01-05',
    bio: 'Renowned Japanese animator and director.',
    profile_img_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Hayao_Miyazaki_cropped_1_Hayao_Miyazaki_201211.jpg',
    popularity: 100
  },
  {
    name: 'Rumi Hiiragi',
    birthdate: '1987-08-01',
    bio: 'Japanese actress.',
    profile_img_url: 'https://static.wikia.nocookie.net/dubbing9585/images/9/93/Rumi_Hiiragi.jpg/revision/latest?cb=20250228221140',
    popularity: 75
  },
  {
    name: 'Miyu Irino',
    birthdate: '1988-02-19',
    bio: 'Japanese actor and singer.',
    profile_img_url: 'https://cdn.animenewsnetwork.com/thumbnails/max500x600/encyc/P1207-1874425324.1665036023.jpg',
    popularity: 80
  },
  // Interstellar cast & crew
  {
    name: 'Christopher Nolan',
    birthdate: '1970-07-30',
    bio: 'British‑American film director, writer, producer.',
    profile_img_url: 'https://blogs.umb.edu/cinemastudies/files/2018/02/christopher-nolan-2m1uvfo.jpg',
    popularity: 99
  },
  {
    name: 'Matthew McConaughey',
    birthdate: null,
    bio: 'American actor.',
    profile_img_url: 'https://cdn.britannica.com/40/174140-050-0DDBED29/Matthew-McConaughey-2012.jpg',
    popularity: 95
  },
  {
    name: 'Anne Hathaway',
    birthdate: null,
    bio: 'American actress.',
    profile_img_url: 'https://hips.hearstapps.com/hmg-prod/images/gettyimages-1202429904.jpg?crop=1xw:1.0xh;center,top&resize=640:*',
    popularity: 95
  },
  {
    name: 'Jessica Chastain',
    birthdate: null,
    bio: 'American actress.',
    profile_img_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNIZiFze3Z7CUeg0ODLxBMVyii-yB8DD0YhQ&s',
    popularity: 92
  },
  {
    name: 'Michael Caine',
    birthdate: null,
    bio: 'English actor.',
    profile_img_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Michael_Caine_-_Viennale_2012_g_%28cropped%29.jpg',
    popularity: 93
  },
  {
    name: 'Ellen Burstyn',
    birthdate: null,
    bio: 'American actress.',
    profile_img_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-8NjP33OskxfF53pBlht-2RdF4PjesCSAJw&s',
    popularity: 90
  },
  {
    name: 'Mackenzie Foy',
    birthdate: null,
    bio: 'American actress.',
    profile_img_url: 'https://media.vanityfair.com/photos/54ca934da298661966ed3411/master/w_2560%2Cc_limit/image.jpg',
    popularity: 88
  }
];

async function findOrCreatePerson({ name, birthdate, bio, profile_img_url, popularity }) {
  const existing = await pool.query('SELECT person_id FROM person WHERE name = $1', [name]);
  if (existing.rows.length) return existing.rows[0].person_id;

  const insert = await pool.query(
    `INSERT INTO person (name, birthdate, bio, profile_img_url, popularity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING person_id`,
    [name, birthdate, bio, profile_img_url, popularity]
  );
  return insert.rows[0].person_id;
}

async function seedPeople() {
  console.log('Seeding people...');
  for (const person of people) {
    const id = await findOrCreatePerson(person);
    console.log(`✅ Added or found person: ${person.name} (ID: ${id})`);
  }
  console.log('All done!');
  process.exit(0);
}

seedPeople().catch(err => {
  console.error(err);
  process.exit(1);
});
