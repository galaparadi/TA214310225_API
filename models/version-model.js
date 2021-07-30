const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const versionSchema = new Schema({
	documentId: ObjectId,
	version: Number,
	author: String,
});

versionSchema.pre('save', async function (next) {
	console.log('this version schema is saving...');
	let { version: lastVersion } = await mongoose.model('version', this.schema).findOne({ documentId: this.documentId }).sort({ version: -1 }).exec();
	this.version = lastVersion + 1
	console.log(this);
	next()
})

versionSchema.index({ documentId: 1, version: -1 });

const Version = mongoose.model('version', versionSchema);

module.exports = Version;