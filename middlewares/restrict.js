const HttpRequestError = require('../utils/error');
const { validateId } = require('../utils/validator');

module.exports = {
    authorizeUserIdParam: async (req, res, next) => {
        try {
            const { error, value } = validateId({ id: req.params.userId });

            if (error) {
                throw error;
            }

            if (req.userRole === 'ADMIN' || req.userId === parseInt(value.id)) {
                next();
            } else {
                throw new HttpRequestError(403, 'Restricted', [
                    {
                        message: 'Access to that resource is forbidden',
                        context: {
                            key: 'request.params.user_id',
                            value: value.id,
                        },
                    },
                ]);
            }
        } catch (err) {
            next(err);
        }
    },
};
