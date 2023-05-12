const { fetchCommentsByArticleId, createNewCommentByArticleId } = require('../models/comments.model')

exports.getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params;

    return fetchCommentsByArticleId(article_id)
        .then(comments => res.status(200).send({comments}))
        .catch(err => next(err))
}

exports.postNewCommentByArticleId = (req, res, next) => {
    const newComment = req.body;
    const {article_id} = req.params;

    return createNewCommentByArticleId(article_id, newComment)
        .then((comment) => res.status(201).send({comment}))
        .catch(err => next(err))
}