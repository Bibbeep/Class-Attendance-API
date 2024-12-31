const HttpRequestError = require('./error');

module.exports = (err, req, res, next) => {
    if (err instanceof HttpRequestError) {
        return res.status(err.code).json({
            status: 'fail',
            code: err.code,
            message: err.message,
        });
    }

    return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal server error',
    });
};
