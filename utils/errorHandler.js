const Joi = require('joi');
const HttpRequestError = require('./error');
const { Prisma } = require('@prisma/client');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    if (err instanceof Joi.ValidationError) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: null,
            message: 'Request body validation error',
            errors: err.details.length
                ? err.details.map((e) => {
                      return {
                          message: e.message,
                          context: {
                              key: e.context.key,
                              value: e.context.value,
                          },
                      };
                  })
                : [],
        });
    } else if (err instanceof HttpRequestError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            statusCode: err.statusCode,
            data: null,
            message: err.message,
            errors: err.details.length
                ? err.details.map((e) => {
                      return {
                          message: e.message,
                          context: {
                              key: e.context.key,
                              value: e.context.value,
                          },
                      };
                  })
                : [],
        });
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: null,
            message: 'Unable to communicate with database',
            errors: [
                { message: 'There is an issue with the database connection' },
            ],
        });
    } else {
        console.log(err);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: null,
            message: 'Internal server error',
            errors: [{ message: 'There is an issue with the server' }],
        });
    }
};
