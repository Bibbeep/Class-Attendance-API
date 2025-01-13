const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const googleConfigs = require('../configs/google');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        googleConfigs,
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, name, emails } = profile;
                const email = emails?.[0]?.value || null;

                const oauth2Client = new google.auth.OAuth2();
                oauth2Client.setCredentials({ access_token: accessToken });

                const peopleService = google.people({
                    version: 'v1',
                    auth: oauth2Client,
                });

                const peopleResponse = await peopleService.people.get({
                    resourceName: 'people/me',
                    personFields: 'birthdays',
                });

                const birthDates = peopleResponse.data.birthdays || [];
                const birthDate = birthDates[0]?.date || null;

                const user = await prisma.user.upsert({
                    where: { email },
                    update: {
                        googleId: id,
                        firstName: name.givenName,
                        lastName: name.familyName || null,
                        isVerified: true,
                        birthDate: birthDate
                            ? new Date(
                                  Date.UTC(
                                      birthDate.year,
                                      birthDate.month - 1,
                                      birthDate.day,
                                  ),
                              )
                            : null,
                    },
                    create: {
                        googleId: id,
                        email,
                        firstName: name.givenName,
                        lastName: name.familyName || null,
                        isVerified: true,
                        birthDate: birthDate
                            ? new Date(
                                  Date.UTC(
                                      birthDate.year,
                                      birthDate.month - 1,
                                      birthDate.day,
                                  ),
                              )
                            : null,
                        role: 'STUDENT',
                    },
                });

                return done(null, user);
            } catch (err) {
                done(err, null);
            }
        },
    ),
);

module.exports = passport;
