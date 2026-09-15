import { Request, Response, NextFunction } from 'express';
import URLService from '../services/urlService';
import ClickService from '../services/clickService';
import { IURL } from '../models/URL';
import mongoose from 'mongoose';

export const shortenURL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a URL to shorten'
      });
    }

    const url = await URLService.createShortURL(originalUrl);
    
    res.status(201).json({
      status: 'success',
      data: {
        url: {
          id: url._id,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          shortLink: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.shortCode}`,
          clicks: url.clicks,
          createdAt: url.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllURLs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await URLService.getAllURLs(page, limit);
    
    res.status(200).json({
      status: 'success',
      results: result.urls.length,
      data: {
        urls: result.urls.map(url => ({
          id: url._id,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          shortLink: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.shortCode}`,
          clicks: url.clicks,
          createdAt: url.createdAt
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getURLStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid URL ID'
      });
    }

    const url = await URLService.getURLByShortCode(id) || 
                 await URLService.getURLByShortCode(id); // Try as shortCode first
    
    if (!url) {
      // Try finding by ID
      const urlById = await URLService.getURLByShortCode(id); // This won't work, let me fix this
      // Actually, let me rewrite this properly
    }
    
    // Fix: Get URL by ID or shortCode
    let urlDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      urlDoc = await URLService.getURLByShortCode(id); // This is wrong, let me fix approach
    }
    
    // Better approach: try both
    urlDoc = await URL.findById(id);
    if (!urlDoc) {
      urlDoc = await URL.findOne({ shortCode: id });
    }
    
    if (!urlDoc) {
      return res.status(404).json({
        status: 'fail',
        message: 'URL not found'
      });
    }

    const stats = await ClickService.getURLStats(urlDoc._id);
    
    res.status(200).json({
      status: 'success',
      data: {
        url: {
          id: urlDoc._id,
          originalUrl: urlDoc.originalUrl,
          shortCode: urlDoc.shortCode,
          clicks: urlDoc.clicks,
          createdAt: urlDoc.createdAt
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};