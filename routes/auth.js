var express = require('express');
const verifyToken = require('../lib/verifyToken');
var router = express.Router();
const authController = require('../controller/api/auth.js');

router.get('/', (req,res,next) => {
	res.send({status: 0, message:"forbidden"});
});
router.post('/googleuser',authController.googleAuth);
router.post('/user', authController.userAuth);

module.exports = router;
