const { getInstructions } = require('../controllers/main.controller')
const express = require('express');

const router = express.Router();

router.route('/')
    .get(getInstructions)

module.exports = router;