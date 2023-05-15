const express = require('express');
const topicRouter = require('./routers/topics.router')
const articleRouter = require('./routers/articles.router')
const mainRouter = require('./routers/main.router')
const commentRouter = require('./routers/comments.router')
const userRouter = require('./routers/users.router')
const { handleDatabaseError, handleCustomError, handleRestError, handleInvalidEndpoint } = require('./controllers/errors.handler')

const app = express();

app.use(express.json())

app.use('/api', mainRouter)

app.use('/api/topics', topicRouter)

app.use('/api/articles', articleRouter)

app.use('/api/users', userRouter)

app.use('/api/comments', commentRouter)

app.use(handleInvalidEndpoint)
    
app.use(handleDatabaseError)

app.use(handleCustomError)

app.use(handleRestError)



module.exports = app;