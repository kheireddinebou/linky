import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export default redis;

// docker run -d --name redis -p 6379:6379 redis