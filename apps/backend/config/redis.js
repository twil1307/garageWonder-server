import { createClient } from 'redis';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
// eslint-disable-next-line no-undef
// export const redisClient = createClient(process.env.REDIS_PORT);
// export const redisClient = new Redis(process.env.REDIS_PORT);
export const redisClient = new Redis({
    username: process.env.REDIS_RENDER_USERNAME, // Render Redis name, red-xxxxxxxxxxxxxxxxxxxx
    host: process.env.REDIS_RENDER_HOST,             // Render Redis hostname, REGION-redis.render.com
    password: process.env.REDIS_RENDER_PASSWORD,     // Provided password
    port: process.env.REDIS_RENDER_PORT || 6379,     // Connection port
    tls: true, // TLS required when externally connecting to Render Redis
  });

export const redisOptions = {
    redis: { 
        port: process.env.REDIS_RENDER_PORT, 
        password: process.env.REDIS_RENDER_PASSWORD,
        host: process.env.REDIS_RENDER_HOST,
        username: process.env.REDIS_RENDER_USERNAME,
        tls: true
    },
};

// connect to redis
const connectRedis = async () => {
    try {
        redisClient.on("connect", () => {
            console.log("Redis connected successfully");
          });
          
          // Handle connection errors
          redisClient.on("error", (err) => {
            console.error("Error connecting to Redis:", err);
          });
    } catch (error) {
        console.log('Connect to redis failed ', error);
    }
};

export default connectRedis;
