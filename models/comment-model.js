const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = new Schema({
	author : {type: Schema.Types.ObjectId, ref: 'user'},
	documentId : Schema.Types.ObjectId,
	comment : String,
	datePost : Date,
	replyComment : [{type: Schema.Types.ObjectId, ref: 'user'}]
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;