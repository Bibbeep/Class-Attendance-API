/* eslint-disable no-undef */
const { findById, patchById, deleteById } = require('../../models/user');
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
                phone_number: '+6281111111111',
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

    describe('patchById Tests', () => {
        it('should return user data', async () => {
            const data = {
                id: '1',
                value: {
                    email: 'newtest1@mail.com',
                    phone_number: '+6281399000099',
                    password: 'newpassword123',
                    first_name: 'New Student',
                    last_name: 'Name 1',
                    birth_date: '2003-12-12',
                },
            };

            const returnData = await patchById(data);

            expect(returnData.user).toMatchObject({
                id: parseInt(data.id),
                email: data.value.email,
                phone_number: data.value.phone_number,
                first_name: data.value.first_name,
                last_name: data.value.last_name,
                birth_date: data.value.birth_date,
                created_at: returnData.user.created_at,
                updated_at: returnData.user.updated_at,
                is_verified: returnData.user.is_verified,
                role: returnData.user.role,
            });
        });

        it('should return user data if updated partially', async () => {
            const data = {
                id: '1',
                value: {
                    first_name: 'New Student',
                    last_name: 'Name 1',
                },
            };

            const returnData = await patchById(data);

            expect(returnData.user).toMatchObject({
                id: parseInt(data.id),
                email: 'test1@mail.com',
                phone_number: '+6281111111111',
                first_name: data.value.first_name,
                last_name: data.value.last_name,
                birth_date: '1990-12-31',
                created_at: returnData.user.created_at,
                updated_at: returnData.user.updated_at,
                is_verified: returnData.user.is_verified,
                role: returnData.user.role,
            });
        });

        it('should throw an error if email is already registered', async () => {
            const data = {
                id: '1',
                value: {
                    email: 'test2@mail.com',
                    phone_number: '+6281399000099',
                    password: 'newpassword123',
                    first_name: 'New Student',
                    last_name: 'Name 1',
                    birth_date: '2003-12-12',
                },
            };

            await expect(patchById(data)).rejects.toThrow(
                new HttpRequestError(409, 'Resource conflict', [
                    {
                        message: 'email is already registered',
                        context: {
                            key: 'email',
                            value: data.value.email,
                        },
                    },
                ]),
            );
        });

        it('should throw an error if phone number is already registered', async () => {
            const data = {
                id: '1',
                value: {
                    email: 'test1@mail.com',
                    phone_number: '+6281111111122',
                    password: 'newpassword123',
                    first_name: 'New Student',
                    last_name: 'Name 1',
                    birth_date: '2003-12-12',
                },
            };

            await expect(patchById(data)).rejects.toThrow(
                new HttpRequestError(409, 'Resource conflict', [
                    {
                        message: 'phone_number is already registered',
                        context: {
                            key: 'phone_number',
                            value: data.value.phone_number,
                        },
                    },
                ]),
            );
        });

        it('should throw an error if user is not found', async () => {
            const data = {
                id: '404',
                value: {
                    email: 'test1@mail.com',
                    phone_number: '+6281111111111',
                    password: 'newpassword123',
                    first_name: 'New Student',
                    last_name: 'Name 1',
                    birth_date: '2003-12-12',
                },
            };

            await expect(patchById(data)).rejects.toThrow(
                new HttpRequestError(404, 'Resource not found', [
                    {
                        message: 'User does not exist',
                        context: {
                            key: 'request.params.user_id',
                            value: data.id,
                        },
                    },
                ]),
            );
        });
    });

    describe('deleteById Tests', () => {
        it('should delete user data', async () => {
            const data = { userId: '1' };
            await deleteById(data);

            const user = await prisma.user.findUnique({
                where: { id: parseInt(data.userId) },
            });

            expect(user).toBe(null);
        });

        it('should throw an error if user does not exist', async () => {
            const data = { userId: '404' };

            await expect(deleteById(data)).rejects.toThrow(
                new HttpRequestError(404, 'Resource not found', [
                    {
                        message: 'User does not exist',
                        context: {
                            key: 'request.params.user_id',
                            value: parseInt(data.userId),
                        },
                    },
                ]),
            );
        });
    });
});
