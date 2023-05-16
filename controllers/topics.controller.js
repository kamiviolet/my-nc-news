const {fetchTopics, createNewTopic } = require('../models/topics.model')

exports.getTopics = (req, res, next) => {
    return fetchTopics()
        .then((topics) => res.status(200).send({topics}))
        .catch(err => next(err));
}

exports.makeNewTopic = (req, res, next) => {
    const newTopic = req.body;

    return createNewTopic(newTopic)
        .then((newTopic) => res.status(201).send({newTopic}))
        .catch(err => next(err));
}