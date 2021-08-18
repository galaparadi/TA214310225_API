const mongoose = require('mongoose');
const WorkspaceUser = require('./workspaceuser-model');
const Document = require('./document-model');
const Filetree = require('./category-model');
const { writeDocumentFile, readDocumentFile } = require('../lib/fs-helper');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const subDocumentSchema = new Schema({
	name: String,
	type: String,
	creator: { type: ObjectId, ref: 'user' },
	category: Schema.Types.ObjectId,
	documentId: { type: ObjectId, ref: 'document' },
	enable: { type: Boolean, default: true },
	dateCreated: { type: Date, default: new Date() },
}, { _id: false })

const SubDocument = mongoose.model('sub-document', subDocumentSchema);

const workspaceSchema = new Schema({
	name: { type: String, unique: true },
	users: [WorkspaceUser.schema],
	documents: [subDocumentSchema],
	description: String,
	picture: String,
	filetree: [Filetree.schema],
});

workspaceSchema.methods.getUsers = async function () {
	let users = this.users.map(user => new WorkspaceUser(user));
	for (let user of users) {
		await user.populate('user').execPopulate()
	}
	return users;
}

workspaceSchema.methods.getDocuments = async function ({ limit = 0 }) {
	let documents = this.documents.map(document => new SubDocument(document));
	if (limit) document.slice(0, limit);

	// Performance issues
	// for (let document of documents) {
	// 	await document.populate({ path: 'files', populate: { path: 'files' } }).execPopulate()
	// }
	return documents;
}

/**
 * 
 * @param {*} param0 
 * @returns {Promise} {category, creator, dateCreated, documentId, enable, id, name, type}
 */
workspaceSchema.methods.getDocument = async function ({ documentId }) {
	let subDoc = new SubDocument(this.documents.find(document => String(document.documentId) === String(documentId)));
	await subDoc.populate('creator').populate('documentId').execPopulate();
	return subDoc;
}

workspaceSchema.methods.getAdminUser = async function () {
	let result = await new WorkspaceUser(this.users.find(user => user.level === 0)).populate('user').execPopulate();
	return result.user;
}

workspaceSchema.methods.addNewDocumentVersion = async function ({ fsId, documentId, document: body, metadata, file }) {
	try {
		let document = await Document.findById(documentId).exec();
		if (fsId) {
			document.version.push(fileId)
		} else {
			metadata.version = document.version.length + 1;
			let { id: fileId, error } = await writeDocumentFile({ body, file, metadata });
			if (error) throw error;
			document.version.push(fileId)
		}

		let data = await document.save();
		return { status: 1, data }
	} catch (error) {
		console.log(error);
		return { error }
	}
}

workspaceSchema.methods.addDocument = async function ({ document: body, metadata, file }) {
	try {
		let { id: fileId, error } = await writeDocumentFile({ body, file, metadata });
		if (error) throw error;
		let document = new Document({ name: body.name, creator: body.creator });
		document.version.push(fileId);

		let subDocument = new SubDocument({ name: body.name, creator: body.creator, documentId: document.id });
		this.documents.push(subDocument);

		await document.save();
		await this.save();
		return { status: 1 }
	} catch (error) {
		console.log(error);
		return { error }
	}
}

//======== old methods

workspaceSchema.methods.openCategory = function (categoryId) {
	let pipeline = [];

	let match = {
		$match: {
			_id: mongoose.Types.ObjectId(this._id)
		}
	}


	let project = {
		$project: {
			name: "$name",
			documents: {
				$filter: {
					input: "$documents",
					as: "wow",
					cond: {
						$eq: ["$$wow.category", mongoose.Types.ObjectId(categoryId)]
					}
				}
			}
		}
	}

	pipeline.push(match);
	pipeline.push(project);
	return mongoose.model('workspace').aggregate(pipeline).exec();
}

workspaceSchema.methods.addCategory = function (objCategory) {
	this.filetree.push(objCategory);
	return this.save();
}

workspaceSchema.methods.getUsersDetail = function () {
	let idWorkspace = this._id;

	let pipeline = [];

	let matchWorkspace = {
		$match: { _id: mongoose.Types.ObjectId(idWorkspace) }
	}

	let unwind = {
		$unwind: "$users"
	}


	let lookup = {
		$lookup: {
			from: "users",
			localField: "users.user",
			foreignField: "_id",
			as: "detailUser",
		}
	}


	let projectLookup = {
		$project: {
			level: "$users.level",
			disable: "$users.disable",
			detailUser: { $arrayElemAt: ["$detailUser", 0] }
		}
	};

	let projectFinal = {
		$project: {
			idUser: "$detailUser._id",
			username: "$detailUser.username",
			email: "$detailUser.email",
			level: "$users.level",
			disable: "$users.disable",
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
		$match: {
			name: nameWorkspace
		}
	}

	let project = {
		$project: {
			"_id": 0,
			documents: {
				$filter: {
					input: "$documents",
					as: "wow",
					cond: {
						$eq: ["$$wow.name", documentName]
					}
				}
			}
		}
	}

	let projectVersion = {
		$project: {
			version: {
				$arrayElemAt: ["$documents.versions", 0]
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
		user: mongoose.Types.ObjectId(userWorkspace.user),
		level: userWorkspace.level,
		disable: userWorkspace.disable,
	}));

	return this.save();

}

// workspaceSchema.methods.addDocument = function (objdocument) {
// 	//lakukan pengecekan level user terlebih dahulu
// 	this.documents.push(objdocument);
// 	return this.save();
// }

workspaceSchema.methods.updateUser = function (user) {
	this.users = this.users.map(function (cur) {
		if (cur.user.toString() == this.user.toString()) {
			return this;
		} else {
			return cur
		}
	}, user);

	return this.save();
}

workspaceSchema.methods.updateDocument = function (document) {

	this.documents = this.documents.map(function (cur) {
		if (cur._id.toString() == this._id.toString()) {
			return this;
		} else {
			return cur
		}
	}, document);

	return this.save();
}

workspaceSchema.methods.unJoinUser = function (id) {
	this.users = this.users.filter(function (cur) {
		return cur.user.toString() != id.toString()
	});

	return this.save();
}

workspaceSchema.methods.addVersionDocument = function (documentName) {
	return false;
}

// workspaceSchema.methods.getDocuments = function () {
// 	//perlu opsi populate
// 	let nameWorkspace = this.name;

// 	let pipeline = [];

// 	let match = {
// 		$match: {
// 			name: nameWorkspace
// 		}
// 	}

// 	let unwind = {
// 		$unwind: {
// 			path: "$documents",
// 		}
// 	}

// 	let project = {
// 		$project: {
// 			_id: "$documents._id",
// 			name: "$documents.name",
// 			author: "$documents.author",
// 			fsId: "$documents.fsId",
// 		}
// 	}

// 	let lookup = {
// 		$lookup: {
// 			from: 'users',
// 			localField: 'author',
// 			foreignField: '_id',
// 			as: 'author'
// 		}
// 	}

// 	let finalProject = {
// 		$project: {
// 			author: {
// 				$arrayElemAt: ["$author", 0]
// 			},
// 			name: 1,
// 			fsId: 1,
// 			_id: 1,
// 		}
// 	}

// 	let hideUser = {
// 		$project: {
// 			"author.username": 1,
// 			name: 1,
// 			fsId: 1,
// 			_id: 1,
// 		}
// 	}

// 	pipeline.push(match);
// 	pipeline.push(unwind);
// 	pipeline.push(project);
// 	pipeline.push(lookup);
// 	pipeline.push(finalProject);
// 	pipeline.push(hideUser);

// 	// return this.documents;
// 	return mongoose.model('workspace').aggregate(pipeline);
// }

// workspaceSchema.methods.getDocument = async function (documentID) {
// 	let nameWorkspace = this.name;

// 	let pipeline = [];

// 	let match = {
// 		$match: {
// 			name: nameWorkspace
// 		}
// 	}

// 	let project = {
// 		$project: {
// 			"_id": 0,
// 			documents: {
// 				$filter: {
// 					input: "$documents",
// 					as: "wow",
// 					cond: {
// 						$eq: ["$$wow._id", mongoose.Types.ObjectId(documentID)]
// 					}
// 				}
// 			}
// 		}
// 	}

// 	let projectFinal = {
// 		$project: {
// 			name: { $arrayElemAt: ["$documents.name", 0] },
// 			authorD: { $arrayElemAt: ["$documents.author", 0] },
// 			fsId: { $arrayElemAt: ["$documents.fsId", 0] },
// 			_id: { $arrayElemAt: ["$documents._id", 0] },
// 			version: { $arrayElemAt: ["$documents.version", 0] },
// 			reference: { $arrayElemAt: ["$documents.reference", 0] },
// 			contribute: { $arrayElemAt: ["$documents.contribute", 0] },
// 			read: { $arrayElemAt: ["$documents.read", 0] },
// 		}
// 	}

// 	let lookup = {
// 		$lookup: {
// 			from: 'users',
// 			localField: 'authorD',
// 			foreignField: '_id',
// 			as: 'authorLook',
// 		}
// 	}

// 	let projectLookup = {
// 		$project: {
// 			author: { $arrayElemAt: ["$authorLook", 0] },
// 			name: 1,
// 			fsId: 1,
// 			_id: 1,
// 			version: 1,
// 			reference: 1,
// 			contribute: 1,
// 			read: 1,
// 		}
// 	}
// 	pipeline.push(match);
// 	pipeline.push(project);
// 	pipeline.push(projectFinal);
// 	pipeline.push(lookup);
// 	pipeline.push(projectLookup);

// 	let document = await mongoose.model('workspace').aggregate(pipeline).exec();
// 	return Promise.resolve(document[0]);
// }

workspaceSchema.methods.getUser = function (username) {
	let idWorkspace = this._id;

	let pipeline = [];

	let matchWorkspace = {
		$match: { _id: mongoose.Types.ObjectId(idWorkspace) }
	}

	let projectFinal = {
		$project: {
			username: "$detailUser.username",
			email: "$detailUser.email",
			level: "$users.level",
			disable: "$users.disable",
		}
	}

	let projectLookup = {
		$project: {
			level: "$users.level",
			disable: "$users.disable",
			detailUser: { $arrayElemAt: ["$detailUser", 0] }
		}
	};

	let unwind = {
		$unwind: "$users"
	}

	let lookup = {
		$lookup: {
			from: "users",
			localField: "users.user",
			foreignField: "_id",
			as: "detailUser",
		}
	}

	let matchUser = {
		$match: { username: username }
	}
	pipeline.push(matchWorkspace)
	pipeline.push(unwind);
	pipeline.push(lookup);
	pipeline.push(projectLookup);
	pipeline.push(projectFinal);
	pipeline.push(matchUser);
	return mongoose.model('workspace').aggregate(pipeline);
}



const Workspace = mongoose.model('workspace', workspaceSchema);

module.exports = Workspace;
