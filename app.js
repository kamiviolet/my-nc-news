const express = require('express');
const topics = require('./routers/topics.router');

const app = express();

app.use('/api/topics', topics);

//Error-handler
app.use((err, req, res, next) => {
    if (err) {
        console.error(err.message);
    }
})

module.exports = app;