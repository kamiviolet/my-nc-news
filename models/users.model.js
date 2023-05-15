const db = require('../db/connection');

exports.fetchAllUsers = () => {
    return db.query(`SELECT * FROM users;`)
        .then(({rows}) => rows)
}
exports.fetchUserByUsername = (username) => {
    return db.query(`SELECT * FROM users WHERE username in ($1);`, [username])
        .then(({rows}) => {
            if (!rows.length) {
                return Promise.reject({status: 404, message: `The user ${username} is not found currently.`})
            }
            return rows[0];
        })
}