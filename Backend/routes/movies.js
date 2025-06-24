import express from 'express';
import { addFullMovie, getRecentMovies, getTopRatedMovies, searchMovies } from '../controllers/moviesController.js';

const router = express.Router();

router.post('/full', addFullMovie);
router.get('/top-rated', getTopRatedMovies);
router.get('/recent', getRecentMovies);
router.get('/search', searchMovies);

export default router;
