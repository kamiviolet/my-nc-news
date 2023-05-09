const app = require('./app');
const port = 8888;

app.listen(port, (err) => {
    if (err) { console.err(err.message) }
    else { console.log(`The server is running on ${port}.`) }
});