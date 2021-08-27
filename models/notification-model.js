const mongoose = require('mongoose');
const { ACTION, actionHelper } = require('../lib/notif-helper')
const Schema = mongoose.Schema;
const NOTIF_TYPE = { 'FEED': 0, 'ACTION': 1 };


const notificationSchema = new Schema({
    initiator: String,
    workspace: String,
    receiver: String,
    type: Number, // 0: feed notif, 1: action notif
    content: Object, //{message: String, action: ACTION, data: obj}
    statusRead: { type: Boolean, default: false },
    dateCreated: { type: Date, default: new Date() },
});

notificationSchema.statics.notifType = function () {
    return NOTIF_TYPE
}

notificationSchema.statics.notifAction = function () {
    return ACTION;
}

notificationSchema.methods.executeAction = async function () {
    if (this.type !== NOTIF_TYPE.ACTION) return { error: { message: 'not action notif type' } };
    return await actionHelper[this.content.action](this.content.data);
}

notificationSchema.statics.pushNotif = async function ({ initiator, receiver, workspace, type, content }) {
    let notif = new Notification({ initiator, receiver, workspace, type, content });
    return await notif.save();

}

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;