const express = require('express');
const { getTopics } = require('./controllers/topics.controller')
const { getInstructions } = require('./controllers/main.controller')
const { getArticleById } = require('./controllers/articles.controller')
const app = express();

app.use(express.json())

app.route('/api')
    .get(getInstructions)

app.route('/api/topics')
    .get(getTopics)

app.route('/api/articles/:article_id')
    .get(getArticleById)

//Error-handler
app.use('/*', (req, res, next) => {
    const err = {status: 404, message: 'Not found.'};
    next(err);
})

app.use((err, req, res, next) => {
    if (err.code === '22PO2') {
        res.status(400).send({message: 'Bad request.'});
    } else if (err.status && err.message) {
        res.status(err.status).send({message: err.message});
    }
})


module.exports = app;