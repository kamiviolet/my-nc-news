const { fetchCommentsByArticleId, createNewCommentByArticleId, eraseCommentByCommentId, updateVotesByCommentId } = require('../models/comments.model')

exports.getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params;
    const {limit, p} = req.query;

    return fetchCommentsByArticleId(article_id, limit, p)
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

exports.deleteCommentByCommentId = (req, res, next) => {
    const {comment_id} = req.params;

    return eraseCommentByCommentId(comment_id)
        .then(() => res.status(204).send())
        .catch(err => next(err))
}

exports.patchVotesByCommentId = (req, res, next) => {
    const {comment_id} = req.params;
    const update = req.body;

    return updateVotesByCommentId(comment_id, update)
        .then(comment => res.status(201).send({comment}))
        .catch(err => next(err));
}