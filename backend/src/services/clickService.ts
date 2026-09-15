import Click from '../models/Click';
import { IClick } from '../models/Click';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

export class ClickService {
  /**
   * Log a click event
   */
  static async logClick(urlId: mongoose.Types.ObjectId, request: any): Promise<IClick> {
    const parser = new UAParser();
    const ua = parser.setUA(request.headers['user-agent'] || '').getResult();
    
    const ip = request.ip || 
               request.headers['x-forwarded-for'] || 
               request.headers['x-real-ip'] || 
               '0.0.0.0';
    
    const geo = geoip.lookup(ip);
    
    const click = new Click({
      urlId,
      timestamp: new Date(),
      referrer: request.headers['referer'] || '',
      userAgent: request.headers['user-agent'] || '',
      ipAddress: ip,
      country: geo ? geo.country : undefined,
      device: ua.device.type || ua.os.name || 'unknown'
    });

    await click.save();
    return click;
  }

  /**
   * Get click statistics for a URL
   */
  static async getURLStats(urlId: mongoose.Types.ObjectId): Promise<{
    totalClicks: number;
    recentClicks: Array<{
      timestamp: Date;
      referrer: string;
      userAgent: string;
      country?: string;
      device?: string;
    }>;
    referrers: Array<{ referrer: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
    countries: Array<{ country: string; count: number }>;
  }> {
    const [totalClicks, recentClicks, referrers, devices, countries] = await Promise.all([
      Click.countDocuments({ urlId }),
      Click.find({ urlId })
        .sort({ timestamp: -1 })
        .limit(100)
        .select('-_id timestamp referrer userAgent country device'),
      Click.aggregate([
        { $match: { urlId } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, referrer: '$_id', count: 1 } }
      ]),
      Click.aggregate([
        { $match: { urlId } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, device: '$_id', count: 1 } }
      ]),
      Click.aggregate([
        { $match: { urlId } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, country: '$_id', count: 1 } }
      ])
    ]);

    return {
      totalClicks,
      recentClicks,
      referrers,
      devices,
      countries
    };
  }
}

export default ClickService;