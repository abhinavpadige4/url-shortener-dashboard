import { Router } from 'express';
import { shortenURL, getAllURLs, getURLStats } from '../controllers/urlController';

const router = Router();

// POST /api/urls/shorten - Create a new short URL
router.post('/shorten', shortenURL);

// GET /api/urls - Get all URLs with pagination
router.get('/', getAllURLs);

// GET /api/urls/:id/stats - Get statistics for a specific URL
router.get('/:id/stats', getURLStats);

export default router;