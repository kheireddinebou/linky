import redis from "../config/redis";

export const cacheInRedis = (short_code: string, original_url: string) =>
  redis.set(short_code, original_url, "EX", 60 * 60 * 24); // cache for 24h;
