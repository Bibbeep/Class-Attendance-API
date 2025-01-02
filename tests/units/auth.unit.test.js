/* eslint-disable no-undef */
const { register, verifyOTP } = require('../../models/auth');
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

            expect(returnData).toHaveProperty('otp');
            expect(typeof returnData.otp).toBe('string');
            expect(isNaN(returnData.otp)).toBeFalsy();
        });

        it('should throw an error if email is already registered', async () => {
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

    describe('Verify OTP Model Tests', () => {
        it('should return user data and verifies the new user', async () => {
            const registerData = {
                email: 'test2@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: new Date('2000-01-01'),
            };

            const userData = await register(registerData);

            const data = {
                email: userData.user.email,
                otp: userData.otp,
            };

            const returnData = await verifyOTP(data);

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

            const user = await prisma.user.findUnique({
                where: {
                    id: userData.user.id,
                },
            });

            expect(user.isVerified).toBe(true);

            expect(returnData.user).toMatchObject({
                id: userData.user.id,
                email: userData.user.email,
                first_name: userData.user.first_name,
                last_name: userData.user.last_name,
            });
        });

        it('should throw an error if otp is invalid', async () => {
            const registerData = {
                email: 'test2@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: new Date('2000-01-01'),
            };

            const userData = await register(registerData);

            const data = {
                email: userData.user.email,
                otp: '999999',
            };

            await expect(verifyOTP(data)).rejects.toThrow(
                new HttpRequestError(400, 'Request body validation error', [
                    {
                        message: 'Invalid or expired otp',
                        context: {
                            key: 'otp',
                            value: data.otp,
                        },
                    },
                ]),
            );
        });

        it('should throw an error if email is not registered', async () => {
            const data = {
                email: 'unregistered@mail.com',
                otp: '999999',
            };

            await expect(verifyOTP(data)).rejects.toThrow(
                new HttpRequestError(400, 'Request body validation error', [
                    {
                        message: 'email is not registered',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ]),
            );
        });

        it('should throw an error if email is already verified', async () => {
            const data = {
                email: 'test1@mail.com',
                otp: '999999',
            };

            await expect(verifyOTP(data)).rejects.toThrow(
                new HttpRequestError(409, 'Resource conflict', [
                    {
                        message: 'email is already verified',
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
