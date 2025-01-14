const UserModel = require('../models/user');
const { validateEditUserData } = require('../utils/validator');

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
    editById: async (req, res, next) => {
        try {
            const { error, value } = validateEditUserData(req.body);

            if (error) {
                throw error;
            }

            const data = await UserModel.patchById({
                id: req.params.userId,
                value,
            });

            return res.status(200).json({
                status: 'success',
                status_code: 200,
                data,
                message: 'Successfully updated user data',
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
