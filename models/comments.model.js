const db = require('../db/connection')
const {validateExistingId} = require('../db/seeds/utils')

exports.fetchCommentsByArticleId = (id) => {
    return validateExistingId(id)
        .then(() => db
            .query(`
                SELECT
                comment_id, votes, created_at, author, body, article_id
                FROM comments
                WHERE article_id in ($1)
                ORDER BY created_at DESC;
            `, [id])
        ) 
        .then(({rows}) => rows)
}