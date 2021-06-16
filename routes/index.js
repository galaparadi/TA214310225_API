var express = require('express');
var router = express.Router();

router.get('/',(req,res) => {
    res.status(403).json({status: 'Forbidden'});
});

router.post('/', (req,res) => {
    res.status(403).json({status: 'Forbidden'});
})

module.exports = router;