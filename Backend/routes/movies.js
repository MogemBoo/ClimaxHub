import express from 'express';
import {
    addFullMovie,
    getRecentMovies,
    getTopRatedMovies,
    searchMovies,
    getAllMovies,
    getMovieById
} from '../controllers/moviesController.js';

const router = express.Router();

router.post('/full', addFullMovie);
router.get('/top', getTopRatedMovies);
router.get('/recent', getRecentMovies);
router.get('/search', searchMovies);
router.get('/all', getAllMovies);
router.get('/:id', getMovieById);

export default router;
