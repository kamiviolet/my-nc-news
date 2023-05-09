const fs = require('fs/promises');

const fetchInstructions = () => {
    return fs.readFile(`${__dirname}/../endpoints.json`, 'utf-8')
}

module.exports = {fetchInstructions}