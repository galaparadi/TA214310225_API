const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    workspace: String,
    message: String,
    statusRead: {type: Boolean, default: false},
    sender: String,
    receiver: String,
    date: {type: Date, default: new Date()},
});

const Chat = mongoose.model('chat', chatSchema);

module.exports = Chat;