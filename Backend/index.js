// index.js
import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import moviesRoutes from './routes/movies.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ ClimaxHub backend is up and running!');
});

app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db_time: result.rows[0].now });
  } catch (err) {
    console.error('❌ DB error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.use('/api/movies', moviesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 ClimaxHub backend running at http://localhost:${PORT}`);
});
