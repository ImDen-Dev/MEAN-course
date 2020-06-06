const express = require('express');

const userControllers = require('../controllers/user');
const router = express.Router();

router.post('/signup', userControllers.createUser);

router.post('/login', userControllers.loginUser);

module.exports = router;
