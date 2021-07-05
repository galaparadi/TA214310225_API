const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const notificationSchema = new Schema({
    message: String,
    notifid: ObjectId,
    statusRead: Boolean,
    date: {type: Date, default: new Date()},
});

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;