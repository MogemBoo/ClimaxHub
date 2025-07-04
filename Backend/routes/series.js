import express from 'express';
import {
    addFullSeries,
    getAllSeries,
    getRecentSeries,
    getTopRatedSeries,
    searchSeries,
    getSeriesById

} from '../controllers/seriesController.js';

const router = express.Router();

router.post('/full', addFullSeries);
router.get('/top', getTopRatedSeries);
router.get('/recent', getRecentSeries);
router.get('/search', searchSeries);
router.get('/all', getAllSeries);
router.get('/:id', getSeriesById);

export default router;
