const router = require('express').Router();
const AuthRoutes = require('./auth');

router.use('/api/v1/auth', AuthRoutes);

module.exports = router;
