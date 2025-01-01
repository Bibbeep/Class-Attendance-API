const AuthModel = require('../models/auth');
const { validateRegister } = require('../utils/validator');

module.exports = {
    register: async (req, res, next) => {
        try {
            const { error, value } = validateRegister(req.body);

            if (error) {
                throw error;
            }

            const data = await AuthModel.register(value);

            return res.status(201).json({
                status: 'success',
                statusCode: 201,
                data: {
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        first_name: data.user.firstName,
                        last_name: data.user.lastName,
                    },
                },
                message:
                    'Successfully registered a new account. OTP code has been sent to your email address',
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
