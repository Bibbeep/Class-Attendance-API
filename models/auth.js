const { PrismaClient } = require('@prisma/client');
const HttpRequestError = require('../utils/error');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const prisma = new PrismaClient();

class Auth {
    /**
     * @todo Implement register function
     * @param {Object} data - User registration data
     * @param {string} data.email - The email of the user being created
     * @param {string} data.password - The password of the user being created
     * @param {string} data.first_name - The full name of the user being created
     * @param {string=} data.last_name - The full name of the user being created
     * @param {string} data.birth_date - The birth date of the user being created
     * @returns {Promise<object>} The data of the user being created
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
            step: 300,
        });

        return {
            user,
            otp,
        };
    }
}

module.exports = Auth;
