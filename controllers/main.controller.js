const {fetchInstructions} = require('../models/main.model');

exports.getInstructions = (req, res, next) => {
    return fetchInstructions()
        .then((endpoints) => res.status(200).send({endpoints}))
        .catch(err => next(err));
}