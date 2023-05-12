const endpoints = require('../endpoints.json');

exports.getInstructions = (req, res, next) => {
    res.status(200).send({endpoints})
}