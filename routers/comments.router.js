const { deleteCommentByCommentId } = require('../controllers/comments.controller')
const express = require('express');

const router = express.Router();

router.route('/:comment_id')
    .delete(deleteCommentByCommentId)

module.exports = router;