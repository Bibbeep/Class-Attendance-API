const jwt = require('jsonwebtoken');
const { client: redisClient } = require('../configs/redis');
const HttpRequestError = require('../utils/error');
const { validateAuthorizationHeader } = require('../utils/validator');

module.exports = {
    verifyToken: async (req, res, next) => {
        try {
            const { error, value } = validateAuthorizationHeader(req.headers);

            if (error) {
                throw error;
            }

            const token = value.authorization.split(' ')[1];

            if (!redisClient.isOpen) {
                await redisClient.connect();
            }

            console.log(token);
            const blacklisted = await redisClient.get(`blacklist_${token}`);

            console.log(blacklisted);
            if (blacklisted !== null) {
                throw new HttpRequestError(401, 'Unauthorized', [
                    {
                        message: 'Expired token',
                        context: {
                            key: 'request.headers.authorization',
                            value: 'Bearer ' + '*'.repeat(token.length),
                        },
                    },
                ]);
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    throw new HttpRequestError(401, 'Unauthorized', [
                        {
                            message: 'Invalid or expired token',
                            context: {
                                key: 'request.headers.authorization',
                                value: 'Bearer ' + '*'.repeat(token.length),
                            },
                        },
                    ]);
                }

                req.userId = decoded.id;
                req.userRole = decoded.role;
                req.tokenExp = decoded.exp;
                req.token = token;
                next();
            });
        } catch (err) {
            next(err);
        }
    },
};
