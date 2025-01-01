const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.post('/register', AuthController.register);

module.exports = router;
