const mongoose = require('mongoose');
const Version = require('./version-model');
const User = require('./user-model');
const Comment = require('./comment-model');
const Category = require('./category-model');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const documentSchema = new Schema({
	name : String,
	fsId : ObjectId,
	author : {type: Schema.Types.ObjectId, ref: 'user'},
	type : String,
	version : [Schema.Types.Mixed],
	category : Schema.Types.ObjectId,
	reference : [{type: Schema.Types.ObjectId, ref: 'document'}],
	readPermission : [{type : Schema.Types.ObjectId, ref: 'user'}],
	contributePermisiion : [{type : Schema.Types.ObjectId, ref : 'user'}],
});

documentSchema.methods.getAuthor = function(cb){
	User.findById(this.author._id)
	.exec()
	.then(function(user){
		cb(user);
	})
	.catch(function(err){
		console.log("terjadi error document model : " + err);
		return err;
	});
}

documentSchema.methods.addVersion = function(version,cb){
	this.version.push(version);
	this.save(function(err,document){
		if(err){
			console.log("error document : " + err);
			return err;
		}
		cb();
	});
}

documentSchema.methods.addComment = function(comment){
	this.comments.push(comment._id);
	console.log(this);
	this.save(function(err,doc){
		if(err){
			console.log("error : " + err);
			return err;
		}else{
			comment.save(function(err,comment){
				
			});
		}
	})
}

documentSchema.methods.addReference = function(id){
	this.reference.push(id);
	this.save(function(err,reff){
		if(err){
			console.log("error : " + err);
			return err;
		}
	});
}

const Document = mongoose.model('document', documentSchema);

module.exports = Document;