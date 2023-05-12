const express = require('express');
const { getTopics } = require('./controllers/topics.controller')
const { getInstructions } = require('./controllers/main.controller')
const { getArticleById, getAllArticles, patchVotesByArticleId } = require('./controllers/articles.controller')
const { getCommentsByArticleId, postNewCommentByArticleId, deleteCommentByCommentId } = require('./controllers/comments.controller')
const { handleDatabaseError, handleCustomError, handleRestError, handleInvalidEndpoint } = require('./controllers/errors.handler')
const { getAllUsers } = require('./controllers/users.controller')

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
    .patch(patchVotesByArticleId)

app.route('/api/articles/:article_id/comments')
    .get(getCommentsByArticleId)
    .post(postNewCommentByArticleId)

app.route('/api/comments/:comment_id')
    .delete(deleteCommentByCommentId)

app.route('/api/users')
    .get(getAllUsers)


app.use(handleInvalidEndpoint)
    
app.use(handleDatabaseError)

app.use(handleCustomError)

app.use(handleRestError)



module.exports = app;