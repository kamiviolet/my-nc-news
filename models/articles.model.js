const db = require('../db/connection')

exports.fetchArticleById = (id) => {
    return db
        .query(`
            SELECT
            author, title, article_id, body, topic, created_at, votes, article_img_url
            FROM articles
            WHERE article_id in ($1)
        `, [id])
        .then(({rows}) => {
            if (rows.length === 0) { 
                return Promise.reject({status: 400, message: 'Bad request.'})
            } else {
                return rows[0]; 
            }
        })
}