import express from 'express';
import {
    addFullSeries,
    getAllSeries,
    getRecentSeries,
    getTopRatedSeries,
    searchSeries,
    getSeriesById,
    getSeriesEpisodes

} from '../controllers/seriesController.js';

const router = express.Router();

router.post('/full', addFullSeries);
router.get('/top', getTopRatedSeries);
router.get('/recent', getRecentSeries);
router.get('/search', searchSeries);
router.get('/all', getAllSeries);
router.get('/:id', getSeriesById);
router.get('/:id/episodes', getSeriesEpisodes);

export default router;
