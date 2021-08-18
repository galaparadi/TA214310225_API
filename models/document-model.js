const mongoose = require('mongoose');
const User = require('./user-model');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const documentSchema = new Schema({
	name: String,
	author: { type: ObjectId, ref: 'user' },
	valid: { type: Boolean, default: true },
	version: [{ type: ObjectId, ref: 'file' }],
	readPermission: [{ type: Schema.Types.ObjectId, ref: 'user' }],
	contributePermisiion: [{ type: Schema.Types.ObjectId, ref: 'user' }],
	reference: [{ type: Schema.Types.ObjectId, ref: 'document' }],
});

documentSchema.methods.getAuthor = function (cb) {
	User.findById(this.author._id)
		.exec()
		.then(function (user) {
			cb(user);
		})
		.catch(function (err) {
			console.log("terjadi error document model : " + err);
			return err;
		});
}

documentSchema.methods.addVersion = async function ({fsId}) {
	this.version.push(fsId);
	return await this.save();
}

documentSchema.methods.addComment = function (comment) {
	this.comments.push(comment._id);
	console.log(this);
	this.save(function (err, doc) {
		if (err) {
			console.log("error : " + err);
			return err;
		} else {
			comment.save(function (err, comment) {

			});
		}
	})
}

documentSchema.methods.addReference = function (id) {
	this.reference.push(id);
	this.save(function (err, reff) {
		if (err) {
			console.log("error : " + err);
			return err;
		}
	});
}

const Document = mongoose.model('document', documentSchema);

module.exports = Document;