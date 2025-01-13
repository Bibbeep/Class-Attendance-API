const router = require('express').Router();
const AuthRoutes = require('./auth');
const UserRoutes = require('./user');

router.use(AuthRoutes);
router.use(UserRoutes);

module.exports = router;
