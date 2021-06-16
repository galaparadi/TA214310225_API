var express = require('express');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/keys').token.secret;
var router = express.Router();

router.get('/',(req,res) => {
    //todo : tambahkan autentikasi
    try {
        let token = jwt.sign({dudung:'dudung'}, JWT_SECRET,{expiresIn: 60 });
        res.json({status:1, token});
    } catch (error) {
        res.json({error})
    }
});

router.post('/', (req,res) => {
    //todo : tambahkan autentikasi
    try {
        let token = jwt.sign({dudung:'dudung'}, JWT_SECRET,{expiresIn: 60 });
        res.json({status:1, token});
    } catch (error) {
        res.json({error})
    }
});

module.exports = router;