const redis = require('redis');
const REDIS_DATABASE_URL =
    process.env.REDIS_DATABASE_URL || 'redis://127.0.0.1:6379';

const client = redis.createClient({ url: REDIS_DATABASE_URL });

client.on('connect', () => {
    console.log('Redis database connected');
});

client.on('reconnecting', () => {
    console.log('Redis client reconnecting');
});

client.on('ready', () => {
    console.log('Redis client is ready');
});

client.on('error', (err) => {
    console.error('Redis client error:', err);
});

client.on('end', () => {
    console.log('\nRedis client disconnected');
    console.log('Server is going down now...');
    process.exit();
});

module.exports = {
    client,
};
