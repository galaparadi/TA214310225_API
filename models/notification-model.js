const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    initiator: String,
    workspace: String,
    receiver: String,
    content: Object,
    statusRead: {type: Boolean, default: false},
    date: {type: Date, default: new Date()},
});

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;