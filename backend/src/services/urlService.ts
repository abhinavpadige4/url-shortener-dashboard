import URL from '../models/URL';
import Click from '../models/Click';
import { generateShortCode } from '../utils/base62';
import { getRedisClient } from '../config/redis';
import { IURL } from '../models/URL';
import mongoose from 'mongoose';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

export class URLService {
  /**
   * Create a new short URL
   */
  static async createShortURL(originalUrl: string): Promise<IURL> {
    // Validate URL
    try {
      new URL(originalUrl); // This will throw if invalid
    } catch (error) {
      throw new Error('Invalid URL provided');
    }

    // Check if URL already exists
    let existingURL = await URL.findOne({ originalUrl });
    if (existingURL) {
      return existingURL;
    }

    // Generate unique short code
    let shortCode = generateShortCode();
    let isUnique = false;
    
    while (!isUnique) {
      const urlExists = await URL.findOne({ shortCode });
      if (!urlExists) {
        isUnique = true;
      } else {
        shortCode = generateShortCode();
      }
    }

    // Create new URL entry
    const url = new URL({
      originalUrl,
      shortCode
    });

    await url.save();
    
    // Cache in Redis for fast lookup
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.setEx(
        `url:${shortCode}`, 
        3600, // 1 hour TTL
        JSON.stringify({ 
          originalUrl: url.originalUrl, 
          id: url._id.toString() 
        })
      );
    }

    return url;
  }

  /**
   * Get URL by short code
   */
  static async getURLByShortCode(shortCode: string): Promise<IURL | null> {
    // Try Redis cache first
    const redisClient = getRedisClient();
    if (redisClient) {
      const cached = await redisClient.get(`url:${shortCode}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const url = await URL.findById(parsed.id);
        if (url) return url;
      }
    }

    // Fallback to database
    const url = await URL.findOne({ shortCode });
    return url;
  }

  /**
   * Get all URLs with pagination
   */
  static async getAllURLs(page: number = 1, limit: number = 50): Promise<{ urls: IURL[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [urls, total] = await Promise.all([
      URL.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      URL.countDocuments()
    ]);
    
    return {
      urls,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Update click count for a URL
   */
  static async incrementClickCount(urlId: mongoose.Types.ObjectId): Promise<void> {
    await URL.findByIdAndUpdate(urlId, { $inc: { clicks: 1 } });
  }
}

export default URLService;