const HttpRequestError = require('../utils/error');
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
}

module.exports = User;
