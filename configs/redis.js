const redis = require('redis');
const REDIS_DATABASE_URL =
    process.env.REDIS_DATABASE_URL || 'redis://127.0.0.1:6379';

const client = redis.createClient({ url: REDIS_DATABASE_URL });

client.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('Redis database connected');
    }
});

client.on('reconnecting', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('Redis client reconnecting');
    }
});

client.on('ready', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('Redis client is ready');
    }
});

client.on('error', (err) => {
    console.error('Redis client error:', err);
});

module.exports = {
    client,
};
