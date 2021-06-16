const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId

const feedEventSchema = new Schema({
	userId: ObjectId,
	message: String,
	date: {type: Date, default: Date.now},
    workspace: String,
    action: String,
});

const FeedEvent = mongoose.model('feed-event', feedEventSchema);

module.exports = FeedEvent;