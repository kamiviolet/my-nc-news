const { getTopics, makeNewTopic } = require('../controllers/topics.controller')
const express = require('express');

const router = express.Router();

router.route('/')
    .get(getTopics)
    .post(makeNewTopic)

module.exports = router;