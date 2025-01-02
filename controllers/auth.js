const AuthModel = require('../models/auth');
const { validateRegister, validateVerifyOTP } = require('../utils/validator');
const sendMail = require('../utils/mailer');

module.exports = {
    register: async (req, res, next) => {
        try {
            const { error, value } = validateRegister(req.body);

            if (error) {
                throw error;
            }

            const data = await AuthModel.register(value);

            await sendMail(
                data.user.email,
                'New Account Verification - Your OTP Code',
                `Your OTP Code is ${data.otp}. Please verify your account within 5 minutes.`,
                `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E88E5; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #BDBDBD; border-radius: 8px; background-color: #FFFFFF;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${process.env.APP_LOGO_URL}" alt="${process.env.APP_NAME} Logo" style="max-width: 150px; height: auto;">
                    </div>
                    <h2 style="text-align: center; color: #1E88E5;">Verify Your New Account</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering. To verify your email, please enter the following code:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #BBDEFB; border: 1px solid #BDBDBD; border-radius: 4px; display: inline-block; color: #1E88E5;">
                            ${data.otp}
                        </span>
                    </div>
                    <p>This code will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
                    <p>Best regards,<br>
                    <strong>The ${process.env.APP_NAME} Team</strong></p>
                    <hr style="border: 0; border-top: 1px solid #BDBDBD; margin: 20px 0;">
                    <p style="font-size: 12px; color: #1E88E5;">If you are experiencing issues, please contact 
                        <a href="mailto:${process.env.EMAIL_USER}" style="color: #1E88E5;">${process.env.EMAIL_USER}</a>.
                    </p>
                </div>`,
            );

            return res.status(201).json({
                status: 'success',
                statusCode: 201,
                data: {
                    ...data.user,
                },
                message:
                    'Successfully registered a new account. OTP code has been sent to your email address',
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    verify: async (req, res, next) => {
        try {
            const { error, value } = validateVerifyOTP(req.body);

            if (error) {
                throw error;
            }

            const data = AuthModel.verifyOTP(value);

            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                data: {
                    ...data.user,
                },
                message: 'Successfully verified a new account',
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
