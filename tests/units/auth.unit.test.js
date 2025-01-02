/* eslint-disable no-undef */
const { register } = require('../../models/auth');
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
    const userData = {
        email: 'test1@mail.com',
        password: await bcrypt.hash('testpassword', 10),
        firstName: 'Jenny',
        birthDate: new Date('1990-12-31'),
        otpSecret: speakeasy.generateSecret({ length: 20 }).base32,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        isVerified: true,
        role: 'STUDENT',
    };

    await prisma.user.create({ data: userData });
};

describe('Authentication Unit Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async () => {
        await resetDatabase();
    });

    describe('Register Model Tests', () => {
        it('should return user data and otp', async () => {
            const data = {
                email: 'test2@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: new Date('2000-01-01'),
            };

            const returnData = await register(data);

            expect(returnData).toHaveProperty('user');
            expect(returnData.user).toHaveProperty('id');
            expect(returnData.user).toHaveProperty('email');
            expect(returnData.user).toHaveProperty('first_name');
            expect(returnData.user).toHaveProperty('last_name');

            expect(typeof returnData.user.id).toBe('number');
            expect(typeof returnData.user.email).toBe('string');
            expect(typeof returnData.user.first_name).toBe('string');

            if (returnData.user.last_name) {
                expect(typeof returnData.user.last_name).toBe('string');
            }

            expect(returnData.user).toMatchObject({
                id: 2,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
            });
        });

        it('should throw an error', async () => {
            const data = {
                email: 'test1@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: new Date('2000-01-01'),
            };

            await expect(register(data)).rejects.toThrow(
                new HttpRequestError(409, 'Resource conflict', [
                    {
                        message: 'email is already registered',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ]),
            );
        });
    });
});
