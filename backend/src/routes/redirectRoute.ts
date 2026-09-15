import { Router } from 'express';
import URL from '../models/URL';
import URLService from '../services/urlService';
import ClickService from '../services/clickService';

const router = Router();

// GET /:shortCode - Redirect to original URL and log click
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    
    // Find URL by short code
    const urlDoc = await URLService.getURLByShortCode(shortCode);
    
    if (!urlDoc) {
      return res.status(404).json({
        status: 'fail',
        message: 'Short URL not found'
      });
    }

    // Log the click
    await ClickService.logClick(urlDoc._id, req);
    
    // Increment click count
    await URLService.incrementClickCount(urlDoc._id);
    
    // Redirect to original URL
    res.redirect(302, urlDoc.originalUrl);
  } catch (error) {
    next(error);
  }
});

export default router;