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
                return Promise.reject({status: 404, message: 'No results.'})
            } else {
                return rows[0]; 
            }
        })
}

exports.fetchAllArticles = () => {
    return db
        .query(`
            SELECT
            articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
            FROM articles
            FULL JOIN comments USING (article_id)
            GROUP BY articles.article_id
            ORDER BY created_at DESC;
        `)
        .then(({rows}) => {
            return rows;
        })
}