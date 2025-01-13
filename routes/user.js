const router = require('express').Router();
const UserController = require('../controllers/user');
const { verifyToken } = require('../middlewares/auth');
const { authorizeUserIdParam } = require('../middlewares/restrict');

router.get(
    '/users/:userId',
    verifyToken,
    authorizeUserIdParam,
    UserController.getUserById,
);

module.exports = router;
