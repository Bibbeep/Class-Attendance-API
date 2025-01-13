/* eslint-disable no-undef */
const { findById } = require('../../models/user');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const HttpRequestError = require('../../utils/error');
const prisma = new PrismaClient();

const resetDatabase = async () => {
    const tables = ['User'];
    for (const table of tables) {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
        );
    }
};

const seedDatabase = async () => {
    const data = [
        {
            email: 'test1@mail.com',
            password: await bcrypt.hash('testpassword', 10),
            firstName: 'Jenny',
            birthDate: new Date('1990-12-31'),
            otpSecret: speakeasy.generateSecret({ length: 20 }).base32,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
            isVerified: true,
            role: 'STUDENT',
        },
        {
            email: 'test2@mail.com',
            password: await bcrypt.hash('testpassword', 10),
            firstName: 'Jane',
            lastName: 'Day',
            birthDate: new Date('1995-06-15'),
            otpSecret: speakeasy.generateSecret({ length: 20 }).base32,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
            isVerified: false,
            role: 'STUDENT',
        },
        {
            email: 'test3@mail.com',
            password: await bcrypt.hash('testpassword', 10),
            firstName: 'John',
            lastName: 'Doe',
            birthDate: new Date('1990-01-15'),
            otpSecret: speakeasy.generateSecret({ length: 20 }).base32,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
            isVerified: true,
            role: 'LECTURER',
        },
        {
            email: 'test4@mail.com',
            password: await bcrypt.hash('testpassword', 10),
            firstName: 'Billy',
            lastName: 'Russo',
            birthDate: new Date('2002-10-10'),
            otpSecret: speakeasy.generateSecret({ length: 20 }).base32,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
            isVerified: true,
            role: 'ADMIN',
        },
    ];

    await prisma.user.createMany({ data });
};

describe('User Unit Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async () => {
        await resetDatabase();
    });

    describe('findById Tests', () => {
        it('should return user data', async () => {
            const data = { userId: '1' };
            const returnData = await findById(data);

            expect(returnData.user).toMatchObject({
                id: parseInt(data.userId),
                email: 'test1@mail.com',
                phone_number: null,
                first_name: 'Jenny',
                last_name: null,
                birth_date: '1990-12-31',
                created_at: returnData.user.created_at,
                updated_at: returnData.user.updated_at,
                is_verified: true,
                role: 'STUDENT',
            });
        });

        it('should throw an error if user not found', async () => {
            const data = { userId: '404' };

            await expect(findById(data)).rejects.toThrow(
                new HttpRequestError(404, 'Resource not found', [
                    {
                        message: 'User does not exist',
                        context: {
                            key: 'request.params.user_id',
                            value: data.userId,
                        },
                    },
                ]),
            );
        });
    });
});
