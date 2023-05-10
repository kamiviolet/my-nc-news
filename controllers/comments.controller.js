const { fetchCommentsByArticleId } = require('../models/comments.model')

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

module.exports = { getCommentsByArticleId }