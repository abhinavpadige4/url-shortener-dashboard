import redis from 'redis';

let redisClient: redis.RedisClientType | null = null;

export const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));

    await redisClient.connect();
    console.log('Redis Connected');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Don't exit process as Redis is optional for basic functionality
  }
};

export const getRedisClient = () => {
  return redisClient;
};

export default { connectRedis, getRedisClient };