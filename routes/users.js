var express = require('express');
const UserAPIController = require('../controller/api/user');
const NotificationAPIController = require('../controller/api/notification');
const verifyToken = require('../lib/verifyToken');
var router = express.Router();

// router.use(verifyToken);
router.get('/', (req, res, next) => {
  let endpoints = [];
  res.status(403).json({ status: 0, message: "Forbidden" });
});
router.post('/', UserAPIController.addUser)
  .get('/:username', UserAPIController.getUser)
  .get('/:username/workspaces', UserAPIController.getWorkspaces)
  .put('/:username', UserAPIController.updateUser)
  .delete('/:username', UserAPIController.deleteUser)
  .put('/:username/notifications', NotificationAPIController.putNotification) //FIXME: maybe don't need
  .get('/:username/notifications', NotificationAPIController.getNotification)
  .get('/:username/feeds', UserAPIController.getFeeds)

module.exports = router;
