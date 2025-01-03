/* eslint-disable no-undef */
const { server } = require('../../app');
const request = require('supertest');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const { PrismaClient } = require('@prisma/client');
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

describe('Authentication Integration Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async () => {
        await resetDatabase();
    });

    afterAll(() => {
        server.close();
    });

    describe('POST /api/register Tests', () => {
        it('should successfully registered a user account and return 201', async () => {
            const data = {
                email: 'test2@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: '2000-01-01',
            };

            const response = await request(server)
                .post('/api/register')
                .send(data);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                status: 'success',
                statusCode: 201,
                data: {
                    user: {
                        id: 2,
                        email: data.email,
                        first_name: data.first_name,
                        last_name: data.last_name,
                    },
                },
                message:
                    'Successfully registered a new account. OTP code has been sent to your email address',
                errors: null,
            });
        });

        it('should fail to register a user account and return 400 if invalid request body', async () => {
            const data = {
                email: 'invalidemail',
                password: 123,
                last_name: 1,
                birth_date: '12 Jan 2024',
            };

            const response = await request(server)
                .post('/api/register')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                statusCode: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: '"email" must be a valid email',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                    {
                        message: '"password" must be a string',
                        context: {
                            key: 'password',
                            value: data.password,
                        },
                    },
                    {
                        message: '"first_name" is required',
                        context: {
                            key: 'first_name',
                        },
                    },
                    {
                        message: '"last_name" must be a string',
                        context: {
                            key: 'last_name',
                            value: data.last_name,
                        },
                    },
                    {
                        message: '"birth_date" must be in ISO 8601 date format',
                        context: {
                            key: 'birth_date',
                            value: data.birth_date,
                        },
                    },
                ],
            });
        });

        it('should fail to register a user account and return 409 if email is already registered', async () => {
            const data = {
                email: 'test1@mail.com',
                password: 'password',
                first_name: 'Dummy',
                last_name: 'Dev',
                birth_date: '2000-01-01',
            };

            const response = await request(server)
                .post('/api/register')
                .send(data);

            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                status: 'fail',
                statusCode: 409,
                data: null,
                message: 'Resource conflict',
                errors: [
                    {
                        message: 'email is already registered',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ],
            });
        });
    });

    describe('POST /api/verify Tests', () => {
        it('should successfully verified a new user account and return 200', async () => {
            const registerData = {
                email: 'test2@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: new Date('2000-01-01'),
            };

            const userData = await request(server)
                .post('/api/register')
                .send(registerData);

            const user = await prisma.user.findUnique({
                where: { id: userData.body.data.user.id },
            });

            const otp = speakeasy.totp({
                secret: user.otpSecret,
                encoding: 'base32',
                step: 30,
                window: 10,
            });

            const data = {
                email: userData.body.data.user.email,
                otp,
            };

            const response = await request(server)
                .post('/api/verify')
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                statusCode: 200,
                data: {
                    id: 2,
                    email: registerData.email,
                    first_name: registerData.first_name,
                    last_name: registerData.last_name,
                },
                message: 'Successfully verified a new account',
                errors: null,
            });
        }, 15000);

        it('should fail to verify a new user account and return 400 if invalid request body', async () => {
            const data = {
                email: 123,
            };

            const response = await request(server)
                .post('/api/verify')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                statusCode: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: '"email" must be a string',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                    {
                        message: '"otp" is required',
                        context: {
                            key: 'otp',
                        },
                    },
                ],
            });
        });

        it('should fail to verify a new user account and return 400 if invalid or expired otp', async () => {
            const registerData = {
                email: 'test2@mail.com',
                password: 'testpassword',
                first_name: 'John',
                last_name: 'Doe',
                birth_date: new Date('2000-01-01'),
            };

            const userData = await request(server)
                .post('/api/register')
                .send(registerData);

            const data = {
                email: userData.body.data.user.email,
                otp: '999999',
            };

            const response = await request(server)
                .post('/api/verify')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                statusCode: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: 'Invalid or expired otp',
                        context: {
                            key: 'otp',
                            value: data.otp,
                        },
                    },
                ],
            });
        }, 15000);

        it('should fail to verify a new user account and return 400 if email is not registered', async () => {
            const data = {
                email: 'unregistered@mail.com',
                otp: '999999',
            };

            const response = await request(server)
                .post('/api/verify')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                statusCode: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: 'email is not registered',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ],
            });
        });

        it('should fail to verify a new user account and return 409 if email is already verified', async () => {
            const data = {
                email: 'test1@mail.com',
                otp: '999999',
            };

            const response = await request(server)
                .post('/api/verify')
                .send(data);

            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                status: 'fail',
                statusCode: 409,
                data: null,
                message: 'Resource conflict',
                errors: [
                    {
                        message: 'email is already verified',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ],
            });
        });
    });
});
