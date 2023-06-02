const { getAllUsers, postNewUser, getUserByUsername } = require('../controllers/users.controller')
const express = require('express');

const router = express.Router();

router.route('/')
    .get(getAllUsers)
    .post(postNewUser)

router.route('/:username')
    .get(getUserByUsername)

module.exports = router;