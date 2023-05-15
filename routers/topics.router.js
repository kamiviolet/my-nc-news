const { getTopics } = require('../controllers/topics.controller')
const express = require('express');

const router = express.Router();

router.route('/')
    .get(getTopics)

module.exports = router;