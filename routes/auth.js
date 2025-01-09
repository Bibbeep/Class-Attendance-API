const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
