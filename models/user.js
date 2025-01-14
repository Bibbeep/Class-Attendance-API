const HttpRequestError = require('../utils/error');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class User {
    static async findById(data) {
        const { userId } = data;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            throw new HttpRequestError(404, 'Resource not found', [
                {
                    message: 'User does not exist',
                    context: {
                        key: 'request.params.user_id',
                        value: userId,
                    },
                },
            ]);
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                phone_number: user.phoneNumber,
                first_name: user.firstName,
                last_name: user.lastName,
                birth_date: user.birthDate.toISOString().split('T')[0],
                created_at: user.createdAt,
                updated_at: user.updatedAt,
                is_verified: user.isVerified,
                role: user.role,
            },
        };
    }

    static async patchById(data) {
        const { id, value } = data;
        const {
            email,
            phone_number: phoneNumber,
            password,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
        } = value;

        const isUserExist = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!isUserExist) {
            throw new HttpRequestError(404, 'Resource not found', [
                {
                    message: 'User does not exist',
                    context: {
                        key: 'request.params.user_id',
                        value: id,
                    },
                },
            ]);
        }

        const sameEmail = email
            ? await prisma.user.findUnique({
                  where: { email },
              })
            : undefined;

        if (sameEmail && sameEmail.id !== parseInt(id)) {
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

        const samePhoneNumber = phoneNumber
            ? await prisma.user.findUnique({
                  where: { phoneNumber },
              })
            : undefined;

        if (samePhoneNumber && samePhoneNumber.id !== parseInt(id)) {
            throw new HttpRequestError(409, 'Resource conflict', [
                {
                    message: 'phone_number is already registered',
                    context: {
                        key: 'phone_number',
                        value: phoneNumber,
                    },
                },
            ]);
        }

        const hashedPassword = password
            ? await bcrypt.hash(password, 10)
            : undefined;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                email,
                phoneNumber,
                password: hashedPassword,
                firstName,
                lastName,
                birthDate: birthDate ? new Date(birthDate) : undefined,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                phone_number: user.phoneNumber,
                first_name: user.firstName,
                last_name: user.lastName,
                birth_date: user.birthDate.toISOString().split('T')[0],
                created_at: user.createdAt,
                updated_at: user.updatedAt,
                is_verified: user.isVerified,
                role: user.role,
            },
        };
    }

    static async deleteById(data) {
        const { userId } = data;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            throw new HttpRequestError(404, 'Resource not found', [
                {
                    message: 'User does not exist',
                    context: {
                        key: 'request.params.user_id',
                        value: parseInt(userId),
                    },
                },
            ]);
        }

        await prisma.user.delete({
            where: { id: user.id },
        });
    }
}

module.exports = User;
