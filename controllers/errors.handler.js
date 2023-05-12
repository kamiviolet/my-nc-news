exports.handleInvalidEndpoint = (req, res, next) => {
   res.status(404).send({message: 'Not found.'});
}

exports.handleDatabaseError = (err, req, res, next) => {
    if (err.code) {
        if (err.code === '22P02') {
            res.status(400).send({message: 'Invalid request input.'});
        }
        
        if (err.code === '23502') {
            res.status(400).send({message: 'Invalid request format.'});
        }
    
        if (err.code === '23503') {
            res.status(404).send({message: 'Request value does not exist at the moment in database.'});
        }

        res.status(400).send({message: 'Unidentified database issue.'});

    } else {
        next(err);
    }
}

exports.handleCustomError = (err, req, res, next) => {
    if (err.status && err.message) {
        res.status(err.status).send({message: err.message});
    } else {
        next(err);
    }
}

exports.handleRestError = (err, req, res, next) => {
    res.status(500).send({message: 'Server problem. We are sorry, please try again later.'});
}