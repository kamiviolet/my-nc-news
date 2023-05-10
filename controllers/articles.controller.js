const {fetchArticleById, fetchAllArticles} = require('../models/articles.model')

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params;
    if (Number.isNaN(+article_id) !== false) {
        const err = {status: 400, message: 'Bad request.'}
        next(err);
    } else {
        return fetchArticleById(article_id)
            .then(article => res.status(200).send({article}))
            .catch(err => next(err));
    }
}

exports.getAllArticles = (req, res, next) => {
    return fetchAllArticles()
    .then(articles => res.status(200).send({articles}))
    .catch(err => next(err));
}