const router = require('express').Router();
const AuthRoutes = require('./auth');

router.use('/api', AuthRoutes);

module.exports = router;
