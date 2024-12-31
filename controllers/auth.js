const AuthModel = require('../models/auth');

module.exports = {
    register: async (req, res, next) => {
        res.status(200).json({
            status: 'success',
            code: 200,
            message: 'Success',
        });
    },
};
