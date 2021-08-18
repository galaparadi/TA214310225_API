const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = new Schema({
	sender : String,
	documentId : Schema.Types.ObjectId,
	comment : String,
	datePost :  { type: Date, default: new Date() },
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;