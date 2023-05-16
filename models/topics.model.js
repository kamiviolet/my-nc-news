const db = require('../db/connection');

exports.fetchTopics = () => {
    return db.query(`
        SELECT * FROM topics;
    `).then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, message: 'No results.'});
        } else {
            return rows;
        }
    });
}

exports.createNewTopic = (topic) => {
    const {slug, description} = topic;
    if (slug === undefined) {
        return Promise.reject({status: 400, message: 'Please provide slug to create new topic.'})
    }

    if (description === undefined) {
        return Promise.reject({status: 400, message: 'Please provide description to create new topic.'})
    }

    const query = `
        INSERT INTO topics
        (slug, description)
        VALUES
        ($1, $2)
        RETURNING *;
    `
    return db.query(query, [slug, description])
        .then(({rows}) => rows[0])
}