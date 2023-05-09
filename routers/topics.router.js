const express = require('express');
const router = express.Router();
const { getTopics } = require('../controllers/topics.controller')

router.use(express.json());

router.route('/')
    .get(getTopics)

module.exports = router;