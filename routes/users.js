var express = require('express');
const UserAPIController = require('../controller/api/user');
const verifyToken = require('../lib/verifyToken');
var router = express.Router();

// router.use(verifyToken);
router.get('/', (req, res, next) => {
  let endpoints = [];
  res.status(403).json({ status: 0, message: "Forbidden" });
});
router.post('/', UserAPIController.addUser)
  .post('/:username/feeds', UserAPIController.addFeed)
  .get('/:username', UserAPIController.getUser)
  .get('/:username/workspaces', UserAPIController.getWorkspaces)
  .put('/:username', UserAPIController.updateUser)
  .delete('/:username', UserAPIController.deleteUser)
  .get('/:username/feeds', UserAPIController.getFeed)

module.exports = router;
