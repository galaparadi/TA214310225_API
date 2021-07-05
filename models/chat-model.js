const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    partisant: [String],
    workspace: String,
    chat: {
        message: String,
        sender: String,
    },
    statusRead: {type: Boolean, default: false},
    date: {type: Date, default: new Date()},
});

chatSchema.index({partisant: 1, workspace: 1});

// chatSchema.set('autoIndex',false);

const Chat = mongoose.model('chat', chatSchema);

Chat.on('index', err => {
    if(err){
        console.log("error creating index for Chat model")
        console.log(err)
    }
})

module.exports = Chat;