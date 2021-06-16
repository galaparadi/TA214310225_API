const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const notificationSchema = new Schema({
    type: Number,
    sender: ObjectId,
    receiver: [ObjectId],
    AcceptRedirect: [Schema.Types.Mixed],
    DeclineRedirect: [Schema.Types.Mixed],
    seen: {type: Boolean, default: false},
    valid: {type: Boolean, default: true},
    date: {type: Date, default: new Date()},
    message: String
});

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;