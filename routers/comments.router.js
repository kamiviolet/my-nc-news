const { deleteCommentByCommentId,patchVotesByCommentId } = require('../controllers/comments.controller')
const express = require('express');

const router = express.Router();

router.route('/:comment_id')
    .delete(deleteCommentByCommentId)
    .patch(patchVotesByCommentId)

module.exports = router;