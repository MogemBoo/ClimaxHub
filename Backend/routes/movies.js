import express from 'express';
import { addFullMovie } from '../controllers/moviesController.js';

const router = express.Router();

router.post('/full', addFullMovie);

export default router;
