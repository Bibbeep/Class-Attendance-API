/* eslint-disable no-undef */
const { server } = require('../../app');
const { client: redisClient } = require('../../configs/redis');
const request = require('supertest');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const { PrismaClient } = require('@prisma/client');
const { createPasswordResetToken } = require('../../models/auth');
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
    ];

    await prisma.user.createMany({ data });
};

describe('Authentication Integration Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async () => {
        await resetDatabase();
    });

    beforeAll(() => {
        redisClient.connect();
    });

    afterAll(() => {
        server.close();
        redisClient.quit();
    });

    describe('POST /api/register Tests', () => {
        it('should successfully registered a user account and return 201', async () => {
            const data = {
                email: 'test3@mail.com',
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
                status_code: 201,
                data: {
                    user: {
                        id: 3,
                        email: data.email,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        role: 'STUDENT',
                    },
                },
                message:
                    'Successfully registered a new account. OTP code has been sent to your email address',
                errors: null,
            });
        }, 15000);

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
                status_code: 400,
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
                status_code: 409,
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
                email: 'test3@mail.com',
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
                status_code: 200,
                data: {
                    id: 3,
                    email: registerData.email,
                    first_name: registerData.first_name,
                    last_name: registerData.last_name,
                    role: 'STUDENT',
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
                status_code: 400,
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
                email: 'test3@mail.com',
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
                status_code: 400,
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
                status_code: 400,
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
                status_code: 409,
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

    describe('POST /api/resend-otp Tests', () => {
        it('should successfully resend otp and return 200', async () => {
            const data = { email: 'test2@mail.com' };
            const response = await request(server)
                .post('/api/resend-otp')
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: null,
                message: 'Successfully resend OTP code to your email address',
                errors: null,
            });
        }, 15000);

        it('should fail to resend otp and return 400 if invalid request body', async () => {
            const data = { email: 123 };
            const response = await request(server)
                .post('/api/resend-otp')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
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
                ],
            });
        });

        it('should fail to resend otp and return 400 if email is not registered', async () => {
            const data = { email: 'unregistered@mail.com' };
            const response = await request(server)
                .post('/api/resend-otp')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
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

        it('should fail to resend otp and return 409 if email is already verified', async () => {
            const data = { email: 'test1@mail.com' };
            const response = await request(server)
                .post('/api/resend-otp')
                .send(data);

            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 409,
                data: null,
                message: 'Request body validation error',
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

    describe('POST /api/login Tests', () => {
        it('should successfully logged in a user and return 200', async () => {
            const data = {
                email: 'test1@mail.com',
                password: 'testpassword',
            };

            const response = await request(server)
                .post('/api/login')
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: {
                        id: 1,
                        email: data.email,
                        first_name: 'Jenny',
                        last_name: null,
                        role: 'STUDENT',
                    },
                    accessToken: response.body.data.accessToken,
                },
                message: 'Successfully logged in',
                errors: null,
            });
        });

        it('should fail to logged in a user and return 400 if invalid request body', async () => {
            const data = {
                password: 123,
            };

            const response = await request(server)
                .post('/api/login')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: '"email" is required',
                        context: {
                            key: 'email',
                        },
                    },
                    {
                        message: '"password" must be a string',
                        context: {
                            key: 'password',
                            value: data.password,
                        },
                    },
                ],
            });
        });

        it('should fail to logged in a user and return 400 if email is not verified', async () => {
            const data = {
                email: 'test2@mail.com',
                password: 'testpassword',
            };

            const response = await request(server)
                .post('/api/login')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: 'Email is not verified',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ],
            });
        });

        it('should fail to logged in a user and return 401 if email is not registered', async () => {
            const data = {
                email: 'unregistered@mail.com',
                password: 'testpassword',
            };

            const response = await request(server)
                .post('/api/login')
                .send(data);

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 401,
                data: null,
                message: 'Unauthorized',
                errors: [
                    {
                        message: 'Wrong email or password',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                    {
                        message: 'Wrong email or password',
                        context: {
                            key: 'password',
                            value: '*'.repeat(data.password.length),
                        },
                    },
                ],
            });
        });

        it('should fail to logged in a user and return 401 if incorrect password', async () => {
            const data = {
                email: 'test1@mail.com',
                password: 'incorrectpassword',
            };

            const response = await request(server)
                .post('/api/login')
                .send(data);

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 401,
                data: null,
                message: 'Unauthorized',
                errors: [
                    {
                        message: 'Wrong email or password',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                    {
                        message: 'Wrong email or password',
                        context: {
                            key: 'password',
                            value: '*'.repeat(data.password.length),
                        },
                    },
                ],
            });
        });
    });

    describe('POST /api/forgot-password Tests', () => {
        it('should successfully request password reset link and return 200', async () => {
            const data = { email: 'test1@mail.com' };

            const response = await request(server)
                .post('/api/forgot-password')
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: {
                        email: data.email,
                    },
                },
                message: 'Successfully sent password reset link to your email',
                errors: null,
            });
        }, 15000);

        it('should fail to request password reset link and return 400 if invalid request body', async () => {
            const data = { email: 123 };

            const response = await request(server)
                .post('/api/forgot-password')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
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
                ],
            });
        });

        it('should fail to request password reset link and return 400 if unregistered email', async () => {
            const data = { email: 'unregistered@mail.com' };

            const response = await request(server)
                .post('/api/forgot-password')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: 'Email is not registered',
                        context: {
                            key: 'email',
                            value: data.email,
                        },
                    },
                ],
            });
        });
    });

    describe('POST /api/reset-password Tests', () => {
        it('should successfully reset password and return 200', async () => {
            const userData = await createPasswordResetToken({
                email: 'test1@mail.com',
            });

            const data = {
                token: userData.passwordResetToken,
                newPassword: 'newpassword',
            };

            const response = await request(server)
                .post('/api/reset-password')
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: { email: 'test1@mail.com' },
                },
                message: 'Successfully reset your password',
                errors: null,
            });
        });

        it('should fail to reset password and return 400 if invalid request body', async () => {
            const data = { newPassword: 123 };

            const response = await request(server)
                .post('/api/reset-password')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: '"token" is required',
                        context: {
                            key: 'token',
                        },
                    },
                    {
                        message: '"newPassword" must be a string',
                        context: {
                            key: 'newPassword',
                            value: data.newPassword,
                        },
                    },
                ],
            });
        });

        it('should fail to reset password and return 400 if invalid or expired token', async () => {
            const data = {
                token: 'invalidtoken',
                newPassword: 'newpassword',
            };

            const response = await request(server)
                .post('/api/reset-password')
                .send(data);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: 'Invalid or expired token',
                        context: {
                            key: 'token',
                            value: data.token,
                        },
                    },
                ],
            });
        });
    });

    describe('POST /api/logout Tests', () => {
        beforeEach(() => {
            redisClient.flushDb();
        });

        afterEach(() => {
            redisClient.flushDb();
        });

        it('should successfully logged out a user and return 200', async () => {
            const login = {
                email: 'test1@mail.com',
                password: 'testpassword',
            };

            const loginData = await request(server)
                .post('/api/login')
                .send(login);

            const response = await request(server)
                .post('/api/logout')
                .set(
                    'Authorization',
                    `Bearer ${loginData.body.data.accessToken}`,
                );

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: null,
                message: 'Successfully logged out',
                errors: null,
            });
        });

        it('should fail to logged out a user and return 400 if invalid Authorization headers', async () => {
            const accessToken = 'invalidToken123';
            const response = await request(server)
                .post('/api/logout')
                .set('Authorization', accessToken);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: `"authorization" with value "${accessToken}" fails to match the required pattern: /^Bearer\\s/`,
                        context: {
                            key: 'authorization',
                            value: accessToken,
                        },
                    },
                ],
            });
        });

        it('should fail to logged out a user and return 401 if invalid Bearer token', async () => {
            const accessToken = 'invalidToken123';
            const response = await request(server)
                .post('/api/logout')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 401,
                data: null,
                message: 'Unauthorized',
                errors: [
                    {
                        message: 'Invalid or expired token',
                        context: {
                            key: 'request.headers.authorization',
                            value: 'Bearer ' + '*'.repeat(accessToken.length),
                        },
                    },
                ],
            });
        });
    });
});
