const router = require('express').Router();
const AuthController = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');
const passport = require('../utils/passportGoogle');

router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', verifyToken, AuthController.logout);
router.get(
    '/login/oauth/google',
    passport.authenticate('google', {
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/user.birthday.read',
        ],
    }),
);
router.get(
    '/login/oauth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login/auth/google',
        session: false,
    }),
    AuthController.loginGoogle,
);

module.exports = router;
