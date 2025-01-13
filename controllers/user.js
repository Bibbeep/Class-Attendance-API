const UserModel = require('../models/user');

module.exports = {
    getUserById: async (req, res, next) => {
        try {
            const data = await UserModel.findById(req.params);

            return res.status(200).json({
                status: 'success',
                status_code: 200,
                data,
                message: 'Successfully retrieved user data',
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
