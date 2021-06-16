const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const versionSchema = new Schema({
	documentId : {type : Schema.Types.ObjectId},
	version : Number,
	status : String
});

const Version = mongoose.model('version',versionSchema);

module.exports = Version;