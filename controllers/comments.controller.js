const { fetchCommentsByArticleId, createNewCommentByArticleId } = require('../models/comments.model')

const getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params;
    if (Number.isNaN(+article_id) !== false) {
        const err = {status: 400, message: 'Bad request.'}
        next(err);
    } else {
        return fetchCommentsByArticleId(article_id)
            .then(comments => res.status(200).send({comments}))
            .catch(err => next(err))
    }
}

const postNewCommentByArticleId = (req, res, next) => {
    const newComment = req.body;
    const {article_id} = req.params;

    return createNewCommentByArticleId(article_id, newComment)
        .then((comment) => {
            res.status(201).send({comment: comment[0]})
        })
        .catch(err => {
            return next(err)
        })
}

module.exports = { getCommentsByArticleId, postNewCommentByArticleId }