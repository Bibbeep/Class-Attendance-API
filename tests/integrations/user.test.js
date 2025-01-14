/* eslint-disable no-undef */
const { server } = require('../../app');
const { client: redisClient } = require('../../configs/redis');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const prisma = new PrismaClient();

const resetDatabase = async () => {
    const tables = ['User'];
    for (const table of tables) {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
        );
    }

    await redisClient.flushAll();
};

const seedDatabase = async () => {
    const data = [
        {
            email: 'test1@mail.com',
            phoneNumber: '+6281111111111',
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
            phoneNumber: '+6281111111122',
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

describe('User Integration Tests', () => {
    let studentAccessToken, adminAccessToken;

    beforeAll(() => {
        redisClient.connect();

        studentAccessToken = jwt.sign(
            {
                id: 1,
                first_name: 'Jenny',
                last_name: null,
                role: 'STUDENT',
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
            },
        );

        adminAccessToken = jwt.sign(
            {
                id: 4,
                first_name: 'Billy',
                last_name: 'Russo',
                role: 'ADMIN',
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
            },
        );
    });

    afterAll(() => {
        server.close();
        redisClient.quit();
    });

    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async () => {
        await resetDatabase();
    });

    describe('GET /api/users/:user_id Tests', () => {
        it('should successfully retrieved user data and return 200', async () => {
            const response = await request(server)
                .get('/api/users/1')
                .set('Authorization', `Bearer ${studentAccessToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: {
                        id: 1,
                        email: 'test1@mail.com',
                        phone_number: '+6281111111111',
                        first_name: 'Jenny',
                        last_name: null,
                        birth_date: '1990-12-31',
                        created_at: response.body.data.user.created_at,
                        updated_at: response.body.data.user.updated_at,
                        is_verified: true,
                        role: 'STUDENT',
                    },
                },
                message: 'Successfully retrieved user data',
                errors: null,
            });
        });

        it('should successfully retrieved user data and return 200 as admin', async () => {
            const response = await request(server)
                .get('/api/users/1')
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: {
                        id: 1,
                        email: 'test1@mail.com',
                        phone_number: '+6281111111111',
                        first_name: 'Jenny',
                        last_name: null,
                        birth_date: '1990-12-31',
                        created_at: response.body.data.user.created_at,
                        updated_at: response.body.data.user.updated_at,
                        is_verified: true,
                        role: 'STUDENT',
                    },
                },
                message: 'Successfully retrieved user data',
                errors: null,
            });
        });

        it('should fail to retrieved user data and return 400 if invalid user_id', async () => {
            const response = await request(server)
                .get('/api/users/abc')
                .set('Authorization', `Bearer ${studentAccessToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message:
                            '"id" with value "abc" fails to match the required pattern: /^\\d+$/',
                        context: {
                            key: 'id',
                            value: 'abc',
                        },
                    },
                ],
            });
        });

        it('should fail to retrieved user data and return 400 if Authorization header does not start with Bearer', async () => {
            const response = await request(server)
                .get('/api/users/1')
                .set('Authorization', `${studentAccessToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 400,
                data: null,
                message: 'Request body validation error',
                errors: [
                    {
                        message: `"authorization" with value "${studentAccessToken}" fails to match the required pattern: /^Bearer\\s/`,
                        context: {
                            key: 'authorization',
                            value: `${studentAccessToken}`,
                        },
                    },
                ],
            });
        });

        it('should fail to retrieved user data and return 401 if invalid token', async () => {
            const response = await request(server)
                .get('/api/users/abc')
                .set('Authorization', `Bearer invalidToken`);

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
                            value: 'Bearer ************',
                        },
                    },
                ],
            });
        });

        it('should fail to retrieved user data and return 401 if expired token', async () => {
            await request(server)
                .post('/api/logout')
                .set('Authorization', `Bearer ${studentAccessToken}`);

            const response = await request(server)
                .get('/api/users/abc')
                .set('Authorization', `Bearer ${studentAccessToken}`);

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
                            value: `Bearer ${'*'.repeat(studentAccessToken.length)}`,
                        },
                    },
                ],
            });
        });

        it('should fail to retrieved user data and return 403 if accessing other user resource', async () => {
            const response = await request(server)
                .get('/api/users/4')
                .set('Authorization', `Bearer ${studentAccessToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 403,
                data: null,
                message: 'Restricted',
                errors: [
                    {
                        message: 'Access to that resource is forbidden',
                        context: {
                            key: 'request.params.user_id',
                            value: '4',
                        },
                    },
                ],
            });
        });

        it('should fail to retrieved user data and return 404 if accessing non-existing user', async () => {
            const response = await request(server)
                .get('/api/users/404')
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 404,
                data: null,
                message: 'Resource not found',
                errors: [
                    {
                        message: 'User does not exist',
                        context: {
                            key: 'request.params.user_id',
                            value: '404',
                        },
                    },
                ],
            });
        });
    });

    describe('PATCH /api/users/:user_id Tests', () => {
        it('should successfully updated user data and return 200', async () => {
            const data = {
                email: 'newstudent1@presently.com',
                phone_number: '+6281399000099',
                password: 'newpassword123',
                first_name: 'New Student',
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/1')
                .set('Authorization', `Bearer ${studentAccessToken}`)
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: {
                        id: 1,
                        email: data.email,
                        phone_number: data.phone_number,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birth_date: data.birth_date,
                        created_at: response.body.data.user.created_at,
                        updated_at: response.body.data.user.updated_at,
                        is_verified: response.body.data.user.is_verified,
                        role: response.body.data.user.role,
                    },
                },
                message: 'Successfully updated user data',
                errors: null,
            });
        });

        it('should successfully updated user data partially and return 200', async () => {
            const data = {
                first_name: 'New Student',
                last_name: 'Name 1',
            };

            const response = await request(server)
                .patch('/api/users/1')
                .set('Authorization', `Bearer ${studentAccessToken}`)
                .send(data);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                status: 'success',
                status_code: 200,
                data: {
                    user: {
                        id: 1,
                        email: 'test1@mail.com',
                        phone_number: '+6281111111111',
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birth_date: '1990-12-31',
                        created_at: response.body.data.user.created_at,
                        updated_at: response.body.data.user.updated_at,
                        is_verified: response.body.data.user.is_verified,
                        role: response.body.data.user.role,
                    },
                },
                message: 'Successfully updated user data',
                errors: null,
            });
        });

        it('should fail to update user data and return 400 if invalid request body', async () => {
            const data = {
                email: true,
                phone_number: 6281399000099,
                password: 'newpassword123',
                first_name: 123,
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/1')
                .set('Authorization', `Bearer ${studentAccessToken}`)
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
                        message: '"phone_number" must be a string',
                        context: {
                            key: 'phone_number',
                            value: data.phone_number,
                        },
                    },
                    {
                        message: '"first_name" must be a string',
                        context: {
                            key: 'first_name',
                            value: data.first_name,
                        },
                    },
                ],
            });
        });

        it('should fail to update user data and return 401 if invalid access token', async () => {
            const data = {
                email: true,
                phone_number: 6281399000099,
                password: 'newpassword123',
                first_name: 123,
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/1')
                .set('Authorization', `Bearer invalidToken`)
                .send(data);

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
                            value: `Bearer ${'*'.repeat('invalidToken'.length)}`,
                        },
                    },
                ],
            });
        });

        it('should fail to update user data and return 403 if updating other user data', async () => {
            const data = {
                password: 'newpassword123',
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/3')
                .set('Authorization', `Bearer ${studentAccessToken}`)
                .send(data);

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 403,
                data: null,
                message: 'Restricted',
                errors: [
                    {
                        message: 'Access to that resource is forbidden',
                        context: {
                            key: 'request.params.user_id',
                            value: '3',
                        },
                    },
                ],
            });
        });

        it('should fail to update user data and return 404 if user is not found', async () => {
            const data = {
                password: 'newpassword123',
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/404')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(data);

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 404,
                data: null,
                message: 'Resource not found',
                errors: [
                    {
                        message: 'User does not exist',
                        context: {
                            key: 'request.params.user_id',
                            value: '404',
                        },
                    },
                ],
            });
        });

        it('should fail to update user data and return 409 if email is already registered', async () => {
            const data = {
                email: 'test2@mail.com',
                phone_number: '+6281399000099',
                password: 'newpassword123',
                first_name: 'New Student',
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/1')
                .set('Authorization', `Bearer ${studentAccessToken}`)
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

        it('should fail to update user data and return 409 if phone number is already registered', async () => {
            const data = {
                email: 'test1@mail.com',
                phone_number: '+6281111111122',
                password: 'newpassword123',
                first_name: 'New Student',
                last_name: 'Name 1',
                birth_date: '2003-12-12',
            };

            const response = await request(server)
                .patch('/api/users/1')
                .set('Authorization', `Bearer ${studentAccessToken}`)
                .send(data);

            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                status: 'fail',
                status_code: 409,
                data: null,
                message: 'Resource conflict',
                errors: [
                    {
                        message: 'phone_number is already registered',
                        context: {
                            key: 'phone_number',
                            value: data.phone_number,
                        },
                    },
                ],
            });
        });
    });
});
