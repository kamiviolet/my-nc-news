const { getArticleById, getAllArticles, patchVotesByArticleId, postNewArticle, deleteArticleById } = require('../controllers/articles.controller')
const { getCommentsByArticleId, postNewCommentByArticleId } = require('../controllers/comments.controller')

const express = require('express');

const router = express.Router();

router.route('/')
    .get(getAllArticles)
    .post(postNewArticle)

router.route('/:article_id')
    .get(getArticleById)
    .patch(patchVotesByArticleId)
    .delete(deleteArticleById)

router.route('/:article_id/comments')
    .get(getCommentsByArticleId)
    .post(postNewCommentByArticleId)


module.exports = router;