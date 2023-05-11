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
    if (Object.keys(newComment).length === 0) {
        const err = {status: 400, message: 'It seems you forget to send the request...'}
        next(err);
    } else if (!Object.hasOwn(newComment, 'username') || !Object.hasOwn(newComment, 'body')) {
        const err = {status: 400, message: 'Comment not in correct format.'}
        next(err);
    } else if (Number.isNaN(+article_id) !== false) {
        const err = {status: 400, message: 'Invalid article_id.'}
        next(err);
    } else {
        return createNewCommentByArticleId(article_id, newComment)
            .then((comment) => {
                return res.status(201).send({comment})
            })
            .catch(err => next(err))
    }
}

module.exports = { getCommentsByArticleId, postNewCommentByArticleId }