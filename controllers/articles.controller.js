const {fetchArticleById, fetchAllArticles, updateVotesByArticleId, createNewArticle} = require('../models/articles.model')

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params;
    
    return fetchArticleById(article_id)
        .then(article => res.status(200).send({article}))
        .catch(err => next(err));
}

exports.getAllArticles = (req, res, next) => {
    const {topic, sort_by, order, limit, p} = req.query;

    return fetchAllArticles(topic, sort_by, order, limit, p)
        .then(({articles, total_count}) => res.status(200).send({articles, total_count}))
        .catch(err => next(err));
}

exports.patchVotesByArticleId = (req, res, next) => {
    const {article_id} = req.params;
    const update = req.body;

    return updateVotesByArticleId(article_id, update)
        .then(article => res.status(201).send({article}))
        .catch(err => next(err));
}

exports.postNewArticle = (req, res, next) => {
    const newArticle = req.body;

    return createNewArticle(newArticle)
        .then(article => res.status(201).send({article}))
        .catch(err => next(err));
}