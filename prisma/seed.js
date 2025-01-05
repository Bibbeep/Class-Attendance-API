/* eslint-disable jsdoc/require-jsdoc */
const users = require('./seeds/users.json');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedUser() {
    for (const user of users) {
        await prisma.user.upsert({
            where: {
                email: user.email,
            },
            update: {},
            create: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                birthDate: user.birthDate,
                otpSecret: user.otpSecret,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isVerified: user.isVerified,
                role: user.role,
                passwordResetToken: user.passwordResetToken,
                passwordResetTokenExpirationTime:
                    user.passwordResetTokenExpirationTime,
            },
        });
    }

    await prisma.user.createMany({
        data: [
            {
                email: 'student1@presently.com',
                phoneNumber: '111111111',
                password: bcrypt.hashSync('password', 10),
                firstName: 'Student',
                lastName: '1',
                birthDate: new Date('2000-01-01'),
                isVerified: true,
                role: 'STUDENT',
            },
            {
                email: 'lecturer1@presently.com',
                phoneNumber: '222222222',
                password: bcrypt.hashSync('password', 10),
                firstName: 'Lecturer',
                lastName: '1',
                birthDate: new Date('2000-01-01'),
                isVerified: true,
                role: 'LECTURER',
            },
            {
                email: 'admin1@presently.com',
                phoneNumber: '333333333',
                password: bcrypt.hashSync('password', 10),
                firstName: 'Admin',
                lastName: '1',
                birthDate: new Date('2000-01-01'),
                isVerified: true,
                role: 'ADMIN',
            },
        ],
    });
}

async function main() {
    await seedUser();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
