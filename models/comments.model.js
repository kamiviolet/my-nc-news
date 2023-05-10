const db = require('../db/connection')
const format = require('pg-format')
const {validateExistingId, validateExistingUser} = require('../db/seeds/utils')

exports.fetchCommentsByArticleId = (id) => {
    return validateExistingId(id)
        .then((msg) => {
            if (msg !== undefined) {
                return Promise.reject(msg);
            }
            return db.query(`
                SELECT
                comment_id, votes, created_at, author, body, article_id
                FROM comments
                WHERE article_id in ($1)
                ORDER BY created_at DESC;
            `, [id])
        }) 
        .then(({rows}) => rows)
}

exports.createNewCommentByArticleId = (id, comment) => {
    return validateExistingId(id)
        .then((msg) => {
            if (msg !== undefined) {
                return Promise.reject({status: 400, message: 'Apology. Non-existing article_id.'})
            }
        })
        .then(() => validateExistingUser(comment.username))
        .then((msg) => {
            if (msg !== undefined) {
                return Promise.reject({status: 400, message: 'Apology. Non-existing username, please sign up to leave your comment.'})
            }
        })
        .then(() => {
            return db.query(`
                INSERT INTO comments
                (article_id, body, author)
                VALUES
                ($1, $3, $2)
                RETURNING *;
            `, [id, comment.username, comment.body])
        })
        .then(({rows}) => rows[0])
}