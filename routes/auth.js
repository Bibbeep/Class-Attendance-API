const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.post('/resend-otp', AuthController.resendOTP);

module.exports = router;
