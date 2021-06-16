const mongoose = require('mongoose');
const WorkspaceUser = require('./workspaceuser-model');
const Document = require('./document-model');
const Notification = require('./notification-model');
const Filetree = require('./category-model');

const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const workspaceSchema = new Schema({
	name: {type: String, unique: true},
	users: [WorkspaceUser.schema],
	documents: [Document.schema],
	description : String,
	picture : String,
	filetree : [Filetree.schema],
});

workspaceSchema.methods.openCategory = function(categoryId){
	let pipeline = [];

	let match = {
		$match : {
			_id : mongoose.Types.ObjectId(this._id)
		}
	}


	let project = { 
		$project : {
			name : "$name",
			documents : {
				$filter : {
					input : "$documents",
					as : "wow",
					cond : {
						$eq : ["$$wow.category", mongoose.Types.ObjectId(categoryId)]
					}
				}
			}
		}
	}

	pipeline.push(match);
	pipeline.push(project);
	return mongoose.model('workspace').aggregate(pipeline).exec();
}

workspaceSchema.methods.addCategory = function(objCategory){
	this.filetree.push(objCategory);
	return this.save();
}

workspaceSchema.methods.getUsersDetail = function (){
	let idWorkspace = this._id;

	let pipeline = [];
	
	let matchWorkspace = {
		$match : { _id : mongoose.Types.ObjectId(idWorkspace) }
	}

	let projectFinal = {
		$project : {
			idUser : "$detailUser._id",
			username : "$detailUser.username",
			email : "$detailUser.email",
			level : "$users.level",
			disable : "$users.disable",
		}
	}

	let projectLookup = { 
		$project : {
			level : "$users.level",
			disable : "$users.disable",
			detailUser : {$arrayElemAt : ["$detailUser", 0]}
		}
	};

	let unwind = {
		$unwind : "$users"
	}

	let lookup = {
		$lookup : {
			from : "users",
			localField : "users.user",
			foreignField : "_id",
			as : "detailUser",
		}
	}

	pipeline.push(matchWorkspace)
	pipeline.push(unwind);
	pipeline.push(lookup);
	pipeline.push(projectLookup);
	pipeline.push(projectFinal);
	return mongoose.model('workspace').aggregate(pipeline);
}

workspaceSchema.methods.getDocumentVersion = function (document) {
	let idDoc = document._id;

	let nameWorkspace = this.name;

	let pipeline = [];

	let match = {
		$match : {
			name : nameWorkspace
		}
	}

	let project = { 
		$project : { 
			"_id" : 0,
			documents : {
				$filter : {
					input : "$documents",
					as : "wow",
					cond : {
						$eq : ["$$wow.name" , documentName]
					}
				}
			}
		}
	}

	let projectVersion = { 
		$project : { 
			version : {
				$arrayElemAt : ["$documents.versions", 0]
			}
		}
	}


	pipeline.push(match);
	pipeline.push(project);
	pipeline.push(projectVersion);
	return mongoose.model('workspace').aggregate(pipeline);


	return true;
}

workspaceSchema.methods.addUser = function (userWorkspace) {
	this.users.push(new WorkspaceUser({
		user : mongoose.Types.ObjectId(userWorkspace.user),
		level : userWorkspace.level,
		disable : userWorkspace.disable,
	}));

	return this.save();
	
}

workspaceSchema.methods.addDocument = function(objdocument){
	//lakukan pengecekan level user terlebih dahulu
	this.documents.push(objdocument);
	return this.save();
}

workspaceSchema.methods.updateUser = function(user) {
	this.users = this.users.map(function(cur){
		if(cur.user.toString() == this.user.toString()){
			return this;
		}else{
			return cur
		}
	},user);

	return this.save();
}

workspaceSchema.methods.updateDocument = function(document) {

	this.documents = this.documents.map(function(cur){
		if(cur._id.toString() == this._id.toString()){
			return this;
		}else{
			return cur
		}
	},document);

	return this.save();
}

workspaceSchema.methods.unJoinUser = function(id) {
	this.users = this.users.filter(function(cur){
		return cur.user.toString() != id.toString()
	});
	
	return this.save();
}

workspaceSchema.methods.addVersionDocument = function(documentName){
	return false;
}

workspaceSchema.methods.getDocuments = function(){
	//perlu opsi populate
	let nameWorkspace = this.name;

	let pipeline = [];

	let match = {
		$match : {
			name : nameWorkspace
		}
	}

	let unwind = { 
		$unwind : { 
			path : "$documents",
		}
	}

	let project = { 
		$project : { 
			_id : "$documents._id",
			name : "$documents.name",
			author : "$documents.author",
			fsId : "$documents.fsId",
		}
	}

	let lookup = {
		$lookup : {
			from: 'users',
			localField: 'author',
			foreignField: '_id',
			as: 'author'
		}
	}

	let finalProject = {
		$project : {
			author : {
				$arrayElemAt : ["$author",0]
			},
			name : 1,
			fsId : 1,
			_id : 1,
		}
	}
	
	let hideUser = {
		$project : {
			"author.username" : 1,
			name : 1,
			fsId : 1,
			_id : 1,
		}
	}

	pipeline.push(match);
	pipeline.push(unwind);
	pipeline.push(project);
	pipeline.push(lookup);
	pipeline.push(finalProject);
	pipeline.push(hideUser);

	// return this.documents;
	return mongoose.model('workspace').aggregate(pipeline);
}

workspaceSchema.methods.getDocument = async function(documentID){
	let nameWorkspace = this.name;

	let pipeline = [];

	let match = {
		$match : {
			name : nameWorkspace
		}
	}

	let project = { 
		$project : { 
			"_id" : 0,
			documents : {
				$filter : {
					input : "$documents",
					as : "wow",
					cond : {
						$eq : ["$$wow._id" , mongoose.Types.ObjectId(documentID)]
					}
				}
			}
		}
	}

	let projectFinal = { 
		$project : { 
			name : { $arrayElemAt : ["$documents.name", 0] },
			authorD : { $arrayElemAt : ["$documents.author", 0] },
			fsId : { $arrayElemAt : ["$documents.fsId", 0] },
			_id : { $arrayElemAt : ["$documents._id", 0] },
			version : { $arrayElemAt : ["$documents.version", 0] },
			reference : { $arrayElemAt : ["$documents.reference", 0] },
			contribute : { $arrayElemAt : ["$documents.contribute", 0] },
			read : { $arrayElemAt : ["$documents.read", 0] },
		}
	}

	let lookup = {
		$lookup : {
			from : 'users',
			localField : 'authorD',
			foreignField : '_id',
			as : 'authorLook',
		}
	}

	let projectLookup = {
		$project : {
			author : { $arrayElemAt : ["$authorLook", 0]},
			name : 1,
			fsId : 1,
			_id : 1,
			version : 1,
			reference : 1,
			contribute : 1,
			read : 1,
		}
	}
	pipeline.push(match);
	pipeline.push(project);
	pipeline.push(projectFinal);
	pipeline.push(lookup);
	pipeline.push(projectLookup);

	let document = await mongoose.model('workspace').aggregate(pipeline).exec();
	return Promise.resolve(document[0]);
}

workspaceSchema.methods.getUser = function(username) {	
	let idWorkspace = this._id;

	let pipeline = [];
	
	let matchWorkspace = {
		$match : { _id : mongoose.Types.ObjectId(idWorkspace) }
	}

	let projectFinal = {
		$project : {
			username : "$detailUser.username",
			email : "$detailUser.email",
			level : "$users.level",
			disable : "$users.disable",
		}
	}

	let projectLookup = { 
		$project : {
			level : "$users.level",
			disable : "$users.disable",
			detailUser : {$arrayElemAt : ["$detailUser", 0]}
		}
	};

	let unwind = {
		$unwind : "$users"
	}

	let lookup = {
		$lookup : {
			from : "users",
			localField : "users.user",
			foreignField : "_id",
			as : "detailUser",
		}
	}

	let matchUser = {
		$match : { username : username }
	}
	pipeline.push(matchWorkspace)
	pipeline.push(unwind);
	pipeline.push(lookup);
	pipeline.push(projectLookup);
	pipeline.push(projectFinal);
	pipeline.push(matchUser);
	return mongoose.model('workspace').aggregate(pipeline);
}




/*
// versi lama. tidak menggunakan fitur embeded

const workspaceSchema = new Schema({
    name: {type: String, unique: true},
    users: [WorkspaceUser.schema],
    documents: [Document.schema],
    notifications: [Notification.schema],
    //tree : [Tree.schema],
    description : String,
    picture : String
});

workspaceSchema.methods.findLimited = function(params) {
	return false;
}

workspaceSchema.methods.addUser = function (id, level) {
	let obj = {
		user : mongoose.Types.ObjectId(id),
		level : level
	};
	
	this.users.push(new WorkspaceUser(obj));
	this.save(function(err, workspace) {
		if (err) {
			console.log("error workspace model saat tambah user : " + err);
			return err;
		}
	});
}

workspaceSchema.methods.addDocument = function(objdocument){
	//lakukan pengecekan level user terlebih dahulu
	this.documents.push(objdocument);
	this.save(function(err, workspace){
		if(err){
			console.log("error workspace model saat tambah document : " + err);
			return err;
		}
	});
}

workspaceSchema.methods.updateUser = function(user,cb) {
	this.users = this.users.map(function(cur){
		if(cur.userObjectId.toString() == this.userObjectId.toString()){
			return this;
		}else{
			return cur
		}
	},user);

	this.save(function(err,workspace){
		if(err){
			console.log("error update user : " + err);
			cb(err);
			return err;
		}
		cb();
	});
}

workspaceSchema.methods.unJoinUser = function(id,cb) {
	this.users = this.users.filter(function(cur){
		return cur.userObjectId.toString() != id.toString()
	});
	
	this.save(function(err){
		if(err){
			console.log(err)
			return err;
		}else{
			cb();
		}
	})
}

//mode : false = not using populate, true = using populate (but it's pretty slower)
workspaceSchema.methods.getDocument = function(cb,mode = false){
	if(mode){
		for(let i = 0;i < this.documents.length; i++){
			let path = 'documents.' + i + '.author';
			this.populate(path.toString(),'username'); //si kampret pakek asyncronous
		}

		this.execPopulate(function(err,val){
			cb(val);
		})
	}else{
		cb(this);
	}
}

workspaceSchema.methods.getUser = function(cb) {	
	for(let i = 0;i < this.users.length; i++){
		let path = 'users.' + i + '.user';
		this.populate(path.toString(),'-password -googleAccount -_id -googleId -notifications -workspaces'); //si kampret pakek asyncronous
	}

	this.execPopulate(function(err,val){
		cb(val);
	})
}

workspaceSchema.methods.putNotif = function(notif){
	this.notifications.push(notif);
	this.save().catch(function(err){return err});
}
*/
const Workspace = mongoose.model('workspace', workspaceSchema);

module.exports = Workspace;

// ------------NOTE------------
// SCHEMA STRUCTURE

/*
users : [
	{
		userObjectId: [ObjectId],
		level: number/integer
	}
],
documents : [
	{
		name : String,			//nama document, digunakan untuk keyword pencarian
		author : ObjectId,
		level : number/integer,
		version : [
			_id : ObjectId		//object id dari document yang disimpan
		],
		metadata : {
			type : String,
			author : ObjectId,
			tag : [String]
			...						//belum ditentukan
		}		
	}
],
documentstree : {
	name : String,
	documents : [ObjectId],
	childerns : [Object]
}


{
	name : String,
	level
}
*/