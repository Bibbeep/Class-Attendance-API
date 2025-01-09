const router = require('express').Router();
const AuthController = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', verifyToken, AuthController.logout);

module.exports = router;
