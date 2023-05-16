const db = require('../db/connection')
const {validateExistingArticleId, validateExistingCommentId} = require('../db/seeds/utils')

exports.fetchCommentsByArticleId = (id, limit=10, p=1) => {
    if (isNaN(limit)) {
        return Promise.reject({status: 400, message: `${limit} is not a valid limit value.`})
    }

    if (isNaN(p)) {
        return Promise.reject({status: 400, message: `${p} is not a valid limit value.`})
    }

    return validateExistingArticleId(id)
        .then(() => {
            return db.query(`
                SELECT
                comment_id, votes, created_at, author, body, article_id
                FROM comments
                WHERE article_id in ($1)
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${limit * (p-1)};
            `, [id])
        }) 
        .then(({rows}) => rows)
}

exports.createNewCommentByArticleId = (id, comment) => {
    return db
        .query(`
                INSERT INTO comments
                (article_id, body, author)
                VALUES
                ($1, $3, $2)
                RETURNING *;
            `, [id, comment.username, comment.body])
        .then(({rows}) => rows[0])
}

exports.eraseCommentByCommentId = (id) => {
    return validateExistingCommentId(id)
        .then(() => {
            return db
                .query(`
                    DELETE FROM comments
                    WHERE comment_id in ($1);
                `, [id])
        })
}

exports.updateVotesByCommentId = (id, update) => {
    return validateExistingCommentId(id)
        .then(() => {
            return db.query(`
                UPDATE comments
                SET votes = votes + $2
                WHERE comment_id = $1
                RETURNING *;
            `, [id, update.inc_votes])
        })
        .then(({rows}) => rows[0])
}