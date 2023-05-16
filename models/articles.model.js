const db = require('../db/connection');
const format = require('pg-format');
const {validateExistingArticleId, validateExistingTopic} = require('../db/seeds/utils');


exports.fetchArticleById = (id) => {
    return db
        .query(`
            SELECT
            articles.*, COUNT(comments.article_id) AS comment_count
            FROM articles
            LEFT JOIN comments USING (article_id)
            WHERE article_id in ($1)
            GROUP BY articles.article_id;
        `, [id])
        .then(({rows}) => {
            if (rows.length === 0) { 
                return Promise.reject({status: 404, message: `No articles found for ${id}.`})
            } else {
                const clone = JSON.parse(JSON.stringify(rows[0]))
                clone.comment_count = +rows[0].comment_count
                return clone;
            }
        })
}

exports.fetchAllArticles = (topic, sort='created_at', order='desc', limit=10, p=1) => {
    const greenlist = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'comment_count'];
    const orderOption = ['desc', 'asc'];
    let formattedOrder = order.toUpperCase();
    let queryStr = `
        SELECT
        articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.*) AS comment_count
        FROM articles
        LEFT JOIN comments USING (article_id)`;
    const queryVal = [];

    if (!greenlist.includes(sort)) {
        return Promise.reject({status: 400, message: `Cannot sort by ${sort}.`})
    }

    if (!orderOption.includes(order)) {
        return Promise.reject({status: 400, message: `Cannot order by ${order}.`})
    }

    if (typeof +limit !== 'number') {
        return Promise.reject({status: 400, message: `${limit} is not a valid number.`})
    }

    if (typeof +p !== 'number') {
        return Promise.reject({status: 400, message: `${p} is not a valid number.`})
    }

    if (topic) {
        queryStr += "WHERE articles.topic = $1";
        queryVal.push(topic);
    }

    queryStr += `
        GROUP BY articles.article_id, articles.topic 
        ORDER BY ${sort} ${formattedOrder}
        LIMIT ${limit} OFFSET ${(p-1)*10};
    `

    return validateExistingTopic(topic)
        .then(() => db.query(queryStr, queryVal))
        .then(({rows}) => {        
            const copy = rows.map(d => {
                const clone = JSON.parse(JSON.stringify(d))
                clone.comment_count = +d.comment_count
                return clone;
            });
            return {articles: copy, total_count: copy.length};
        })
}

exports.updateVotesByArticleId = (id, update) => {
    return validateExistingArticleId(id)
        .then(() => {
            return db.query(`
                UPDATE articles
                SET votes = votes + $2
                WHERE article_id = $1
                RETURNING *;
            `, [id, update.inc_votes])
        })
        .then(({rows}) => rows[0])
}

exports.createNewArticle = (article) => {


    const {
        author,
        title,
        topic,
        body,
        article_img_url='https://images.pexels.com/photos/default-avatar.jpg'
    } = article;

    return db.query(`
        INSERT INTO articles
        (author, title, topic, body, article_img_url)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *;
    `, [author, title, topic, body, article_img_url])
        .then(({rows}) => rows[0])
}