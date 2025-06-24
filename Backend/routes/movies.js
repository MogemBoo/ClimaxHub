import express from 'express';
import {
    addFullMovie,
    getRecentMovies,
    getTopRatedMovies,
    searchMovies,
    getAllMovies
} from '../controllers/moviesController.js';

const router = express.Router();

router.post('/full', addFullMovie);
router.get('/top', getTopRatedMovies);
router.get('/recent', getRecentMovies);
router.get('/search', searchMovies);
router.get('/all', getAllMovies);

export default router;
