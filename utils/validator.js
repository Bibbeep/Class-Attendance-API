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

const resendOTPSchema = Joi.object({
    email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).max(30).required(),
});

const bearerJwtSchema = Joi.object({
    authorization: Joi.string()
        .pattern(/^Bearer\s/)
        .required(),
}).unknown(true);

module.exports = {
    validateRegister: validator(registerSchema),
    validateVerifyOTP: validator(verifyOTPSchema),
    validateResendOTP: validator(resendOTPSchema),
    validateLogin: validator(loginSchema),
    validateForgotPassword: validator(forgotPasswordSchema),
    validateResetPassword: validator(resetPasswordSchema),
    validateAuthorizationHeader: validator(bearerJwtSchema),
};
