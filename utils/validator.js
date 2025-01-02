const Joi = require('joi');

const validator = (schema) => {
    return (payload) => {
        return schema.validate(payload, { abortEarly: false });
    };
};

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string(),
    birth_date: Joi.date()
        .iso()
        .less(new Date(Date.now()) - 2 * 365 * 24 * 60 * 60 * 1000)
        .required(),
});

const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

module.exports = {
    validateRegister: validator(registerSchema),
    validateVerifyOTP: validator(verifyOTPSchema),
};
