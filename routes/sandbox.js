var express = require('express');
var router = express.Router();

router.get('/', (req,res) => res.send('aku sandbox'));
router.post('/', (req,res) => res.json(req.session.passport.user));

module.exports = router;