const express = require('express');
const router = express.Router();
const {getInstructions} = require('../controllers/main.controller')

router.use(express.json());

router.route('/')
    .get(getInstructions)

module.exports = router;