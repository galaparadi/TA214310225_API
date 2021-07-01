const express = require('express');
const router = express.Router();
const Chat = require('../models/chat-model');

router.post('/', (req, res) => {
    Chat.create(req.body,(err,data) =>{
        res.send(data);
    })
});

router.get('/', (req, res) => {
    Chat.find({sender: 'dudung'}).sort({date: 'desc'}).exec().then(data => {
        res.send(data);
    })   
});

module.exports = router;