var express = require('express');
const UserAPIController  = require('../controller/api/user');
const verifyToken = require('../lib/verifyToken');
var router = express.Router();

// router.use(verifyToken);
router.get('/', (req,res,next) => {
  let endpoints = [];
  res.status(403).json({status: 0, message: "Forbidden"});
});
router.post('/',UserAPIController.addUser)
router.get('/:username', UserAPIController.getUser);
router.get('/:username/workspaces', UserAPIController.getWorkspaces);
router.put('/:username', UserAPIController.updateUser);
router.delete('/:username', UserAPIController.deleteUser);

router.get('/:username/feeds', UserAPIController.getFeed);
router.post('/:username/feeds', UserAPIController.addFeed);
module.exports = router;
