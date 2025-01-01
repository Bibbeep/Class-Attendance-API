const users = require('./seeds/users.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
