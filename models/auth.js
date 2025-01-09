const { PrismaClient } = require('@prisma/client');
const HttpRequestError = require('../utils/error');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const { randomBytes, createHash } = require('crypto');
const prisma = new PrismaClient();

class Auth {
    /**
     * Method that takes user data, insert them to the database, and generate one-time passcode
     * @param {object} data - User registration data
     * @param {string} data.email - The email of the user being created
     * @param {string} data.password - The password of the user being created
     * @param {string} data.first_name - The full name of the user being created
     * @param {string=} data.last_name - The full name of the user being created
     * @param {string} data.birth_date - The birth date of the user being created
     * @returns {Promise<{ user: { id: number, email: string, first_name: string, last_name: string | null }, otp: string }>} The data of the user being created
     * @throws {HttpRequestError} Will throw an error with 409 statusCode if the user's email is already registered or 500 statusCode if fail to communicate with the database
     */
    static async register(data) {
        const { email, password, first_name, last_name, birth_date } = data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new HttpRequestError(409, 'Resource conflict', [
                {
                    message: 'email is already registered',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpSecret = speakeasy.generateSecret({ length: 20 });

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: first_name,
                lastName: last_name,
                birthDate: birth_date,
                otpSecret: otpSecret.base32,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                isVerified: false,
                role: 'STUDENT',
            },
        });

        const otp = speakeasy.totp({
            secret: otpSecret.base32,
            encoding: 'base32',
            step: 30,
            window: 10,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            otp,
        };
    }

    /**
     * Method that verify one-time passcode against existing user's data in the database
     * @param {object} data - user's email and one-time passcode
     * @param {string} data.email - user's email
     * @param {string} data.otp - One-time passcode to be verified
     * @returns {Promise<{ user: { id: number, email: string, first_name: string, last_name: string } }>} The data of the user being verified
     * @throws {HttpRequestError} Will throw an error with 400 statusCode if email is not registered or invalid/expired OTP, or 409 statusCode if email is already verified
     */
    static async verifyOTP(data) {
        const { email, otp } = data;

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw new HttpRequestError(400, 'Request body validation error', [
                {
                    message: 'email is not registered',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        } else if (user && user.isVerified) {
            throw new HttpRequestError(409, 'Resource conflict', [
                {
                    message: 'email is already verified',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        }

        const isVerified = speakeasy.totp.verify({
            secret: user.otpSecret,
            encoding: 'base32',
            token: otp,
            step: 30,
            window: 10,
        });

        if (!isVerified) {
            throw new HttpRequestError(400, 'Request body validation error', [
                {
                    message: 'Invalid or expired otp',
                    context: {
                        key: 'otp',
                        value: otp,
                    },
                },
            ]);
        }

        await prisma.user.update({
            where: {
                email,
            },
            data: {
                isVerified: true,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
            },
        };
    }

    /**
     * Method that regenerate a user's one-time passcode
     * @param {data} data - user's data
     * @param {string} data.email - user's email
     * @returns {Promise<{ user: { id: number, email: string, first_name: string, last_name: string }, otp: string }>} Returns object with one-time passcode
     * @throws {HttpRequestError} Will throw an error with 400 statusCode if email is not registered or 409 statusCode if email is already verified
     */
    static async regenerateOTP(data) {
        const { email } = data;

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw new HttpRequestError(400, 'Request body validation error', [
                {
                    message: 'email is not registered',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        } else if (user.isVerified) {
            throw new HttpRequestError(409, 'Request body validation error', [
                {
                    message: 'email is already verified',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        }

        const otp = speakeasy.totp({
            secret: user.otpSecret,
            encoding: 'base32',
            step: 30,
            window: 10,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            otp,
        };
    }

    /**
     * Method that authenticate user with email and password
     * @param {object} data - Containing user's email and password
     * @param {string} data.email - User's email
     * @param {string} data.password - User's password
     * @returns {Promise<{ user: { id: number, email: string, first_name: string, last_name: string | null }, accessToken: string }>} The data of the user being verified and JWT access token
     * @throws {HttpRequestError} Will throw an error with 401 statusCode if email is not registered or incorrect password
     */
    static async login(data) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new HttpRequestError(401, 'Unauthorized', [
                {
                    message: 'Wrong email or password',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
                {
                    message: 'Wrong email or password',
                    context: {
                        key: 'password',
                        value: '*'.repeat(password.length),
                    },
                },
            ]);
        }

        const isPasswordTrue = await bcrypt.compare(password, user.password);

        if (!isPasswordTrue) {
            throw new HttpRequestError(401, 'Unauthorized', [
                {
                    message: 'Wrong email or password',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
                {
                    message: 'Wrong email or password',
                    context: {
                        key: 'password',
                        value: '*'.repeat(password.length),
                    },
                },
            ]);
        }

        const payload = {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName || null,
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName || null,
            },
            accessToken,
        };
    }

    /**
     * Method that generate password reset token for a user
     * @param {object} data - Containing user's email
     * @param {string} data.email - User's email
     * @returns {Promise<{ user: { email: string }, passwordResetToken: string }>} The data of the user and password reset token
     * @throws {HttpRequestError} Will throw an error with 400 statusCode if email is not registered
     */
    static async createPasswordResetToken(data) {
        const { email } = data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new HttpRequestError(400, 'Request body validation error', [
                {
                    message: 'Email is not registered',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        }

        const token = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(token).digest('hex');

        await prisma.user.update({
            where: { email },
            data: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpirationTime: new Date(
                    Date.now() + 5 * 60 * 1000,
                ),
            },
        });

        return {
            user: {
                email: user.email,
            },
            passwordResetToken: token,
        };
    }

    /**
     * Method that reset password of a user
     * @param {object} data - Containing password reset token and the new password
     * @param {string} data.token - Password reset token
     * @param {string} data.newPassword - New password to be updated
     * @returns {Promise<{ user: { email: string } }>} The data of the user
     * @throws {HttpRequestError} Will throw an error with 400 statusCode if token is invalid or expired
     */
    static async resetPassword(data) {
        const { token, newPassword } = data;
        const hashedToken = createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpirationTime: {
                    gt: new Date(Date.now()),
                },
            },
        });

        if (!user) {
            throw new HttpRequestError(400, 'Request body validation error', [
                {
                    message: 'Invalid or expired token',
                    context: {
                        key: 'token',
                        value: token,
                    },
                },
            ]);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date(Date.now()),
            },
        });

        return { user: { email: user.email } };
    }
}

module.exports = Auth;
