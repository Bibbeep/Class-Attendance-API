const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.get('/register', AuthController.register);

module.exports = router;