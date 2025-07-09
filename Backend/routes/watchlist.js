import express from 'express';
import {getUserWatchlist} from "../controllers/watchlistController.js";

const router = express.Router();

router.get('/:user_id', getUserWatchlist);

export default router;