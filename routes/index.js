const router = require('express').Router();
const AuthRoutes = require('./auth');

router.use(AuthRoutes);

module.exports = router;
