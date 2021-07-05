const express = require('express');
const router = express.Router();
const Chat = require('../models/chat-model');

router.get('/', (req, res) => {
    res.sendStatus(403);
})

router.post('/', (req, res, next) => {
    req.body.partisant = req.body.partisant.sort();
    Chat.create(req.body, (err, data) => {
        if (err) next(err);
        res.send({ data, status: 1 });
    });
});

router.get('/:username', (req, res) => {
    let queryObject = {
        partisant: {
            $all: [req.params.username, req.query.username]
        },
        workspace: req.query.workspace
    }

    Chat.find(queryObject).exec().then(data => {
        res.send({status: 1, data});
    }).catch(err => {
        next(err);
    });
});

module.exports = router;