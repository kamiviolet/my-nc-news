const express = require('express');
const { getTopics } = require('./controllers/topics.controller')
const { getInstructions } = require('./controllers/main.controller')
const { getArticleById, getAllArticles } = require('./controllers/articles.controller')
const { getCommentsByArticleId, postNewCommentByArticleId } = require('./controllers/comments.controller')
const app = express();

app.use(express.json())

app.route('/api')
    .get(getInstructions)

app.route('/api/topics')
    .get(getTopics)

app.route('/api/articles')
    .get(getAllArticles)

app.route('/api/articles/:article_id')
    .get(getArticleById)

app.route('/api/articles/:article_id/comments')
    .get(getCommentsByArticleId)
    .post(postNewCommentByArticleId)


//Error-handler
app.use('/*', (req, res, next) => {
    const err = {status: 404, message: 'Not found.'};
    next(err);
})
app.use((err, req, res, next) => {
    if (err.code === '22PO2') {
        res.status(400).send({message: 'Bad request.'});
    }
    
    if (err.code === '23502') {
        res.status(400).send({message: 'Invalid request format.'});
    }

    if (err.code === '23503') {
        res.status(404).send({message: 'Request value does not exist at the moment in database.'});
    }
    
    if (err.status && err.message) {
        res.status(err.status).send({message: err.message});
    }

    res.status(400).send({message: 'Bad request.'});
})


module.exports = app;