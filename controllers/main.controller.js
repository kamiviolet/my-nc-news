const {fetchInstructions} = require('../models/main.model');

function getInstructions(req, res, next) {
    return fetchInstructions()
        .then((endpoints) => {
            res.status(200).send({endpoints})
        })
        .catch(err => next(err));
}

module.exports = { getInstructions }