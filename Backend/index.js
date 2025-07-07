import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import moviesRoutes from './routes/movies.js';
import seriesRoutes from './routes/series.js';
import loginRoutes from './routes/login.js';
import signupRoutes from './routes/signup.js';
import cors from 'cors';


dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRoutes); 
app.use('/api/series', seriesRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/signup', signupRoutes);

app.get('/', (req, res) => {
  res.send('running');
});

app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db_time: result.rows[0].now });
  } catch (err) {
    console.error('bada bing bada boom', err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ClimaxHub backend running at http://localhost:${PORT}`);
});
