const { fetchAllUsers, fetchUserByUsername, createNewUser } = require('../models/users.model');

exports.getAllUsers = (req, res, next) => {
    return fetchAllUsers()
        .then((users) => res.status(200).send({users}))
        .catch((err) => next(err))
}

exports.getUserByUsername = (req, res, next) => {
    const {username} = req.params;

    return fetchUserByUsername(username)
        .then((user) => res.status(200).send({user}))
        .catch((err) => next(err))
}

exports.postNewUser = (req, res, next) => {
    const newUser = req.body;

    return createNewUser(newUser)
        .then((user) => res.status(201).send({user}))
        .catch((err) => next(err))
}