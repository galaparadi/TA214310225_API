const mongoose = require('mongoose');
const Notification = require('./notification-model');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const notificationlistSchema = new Schema({
	notifications : [Notification.schema]
});

const NotificationList = mongoose.model('notification', notificationlistSchema);

module.exports = NotificationList;