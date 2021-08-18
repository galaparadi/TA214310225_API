var mongoose = require('mongoose');
const Workspace = require('../../models/workspace-model');
const stream = require('stream');
const Document = require('../../models/document-model');
const Notification = require('../../models/notification-model');
const Comment = require('../../models/comment-model');
let notifHelper = require('../../lib/notif-object');
let { writeDocumentFile } = require('../../lib/fs-helper')
const Version = require('../../models/version-model');

exports.addFiletree = function (req, res, next) {
	Workspace.findOne({ name: req.body.name })
		.exec()
		.then((data) => {
			data.addCategory(req.body.data)
				.then((da) => {
					res.send(da)
				})
				.catch((err) => {
					next(err);
				})
		})
		.catch(err => {
			next(err);
		})
}

exports.joinWorkspace = async (req, res, next) => {
	let { username: initiator } = req.body;
	let { name: workspace } = req.params;
	let workspaces = await Workspace.findOne({ name: workspace }).exec();
	let { username: receiver } = await workspaces.getAdminUser()

	let notif = new Notification({
		initiator, receiver, workspace,
		type: Notification.notifType().ACTION,
		content: {
			message: `${initiator} ingin bergabung kedalam workspace ${workspace}`,
			action: Notification.notifAction().JOIN_WORKSPACE,
			data: {
				joiningUser: initiator,
				workspace: workspace,
			},
		}
	});
	await notif.save()
	res.send({ status: 1, notif })
}

exports.getDocumentVersions = async (req, res, next) => {
	try {
		let { documentId } = req.query;
		let versions = await Version.find({ id: documentId }).exec();
		res.send({ status: 1, data: versions })
	} catch (error) {
		res.status(500).json({ staus: 0, message: error.message })
	}
}

exports.getDocumentVersion = async (req, res, next) => {
	try {
		let { documentId } = req.query;
		let versions = await Version.find({ id: documentId }).exec();
		res.send({ status: 1, data: versions })
	} catch (error) {
		res.status(500).json({ staus: 0, message: error.message })
	}
}

exports.addDocument = async function (req, res, next) {
	try {
		let { filename, author } = req.body;
		let { name } = req.params;
		let file = req.file;

		let metadata = { version: 1 }
		let document = { name: filename, creator: author }
		let workspace = await Workspace.findOne({ name }).exec();
		let { error } = await workspace.addDocument({ document, metadata, file });
		if (error) throw error;
		res.send({ status: 1 });
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, error: error.message })
	}
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {Object} body {documentName, documentId, username: auhtor}
 */
exports.askAddDocumentVersion = async function (req, res, next) {
	let { author: initiator, documentId, filename } = req.body;
	let { name: workspace } = req.params;
	let { username: receiver } = await (await Workspace.findOne({ name: workspace }).exec()).getAdminUser();


	try {
		let { error, id } = await writeDocumentFile({ body: req.body, file: req.file, metadata: { type: req.file.mimetype } });
		if (error) throw error;

		let document = {
			fsId: id,
			author: initiator,
			documentId,
		}
		let notif = new Notification({
			initiator, receiver, workspace,
			type: Notification.notifType().ACTION,
			content: {
				message: `${initiator} ingin menambahkan document version ${filename}`,
				action: Notification.notifAction().ADD_NEW_VERSION,
				data: {
					document,
					initiator,
				},
			}
		});
		await notif.save()
		res.send({ status: 1, notif })
	} catch (error) {
		console.log(error);
		return res.send({ error });
	}
}

/**
 * 
 * @param {*} req
 * @param {*} res 
 * @param {*} next
 * @param {Object} body {filename, file, author} 
 */
exports.addDocumentVersion = async function (req, res, next) {
	try {
		let { docid: documentId, name } = req.params;
		let metadata = {};
		let workspace = await Workspace.findOne({ name }).exec();
		let document = await workspace.getDocument({ documentId });
		document = await workspace.addNewDocumentVersion({ documentId, document: req.body, metadata, file: req.file })
		res.send({ status: 1, workspace, documentId, document })
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'error' })
	}
}

exports.addWorkspace = function (req, res, next) {
	let workspace = new Workspace(req.body);
	workspace.save().then((data) => {
		if (data) {
			res.send({ status: 1, message: "workspace added", workspace: data });
		} else {
			next(err);
		}
	});
}

exports.updateWorkspace = function (req, res, next) {
	Workspace.updateOne({ name: req.body.name }, req.body)
		.exec()
		.then((data) => {
			res.send({ status: 1, message: "data updated" });
		})
		.catch((err) => {
			next(err);
		})
}

exports.getWorkspace = function (req, res, next) {
	Workspace.findOne({ name: req.params.name }).select("-__v")
		.exec().then(function (workspace) {
			if (workspace) {
				res.send({ status: 1, workspace });
			} else {
				res.send({ status: 0, message: "workspace not found" });
			}
		})
		.catch(function (err) {
			res.send({ status: 0, message: err.message });
		});
}

exports.getUsers = function (req, res, next) {
	Workspace.findOne({ name: req.params.name }).select("-__v")
		.exec().then(function (workspace) {
			if (workspace) {
				workspace.getUsersDetail()
					.then((users) => {
						res.send({ status: 1, users });
					})
			} else {
				res.send({ status: 0, message: "workspace not found" });
			}
		})
		.catch(function (err) {
			res.send({ status: 0, message: err.message });
		});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @param {*} body {user, level}
 * @param {*} params {name: workspaceName}
 */
exports.addUser = async function (req, res, next) {
	let { user, level } = req.body;
	let { name } = req.params;

	Workspace.findOne({ name }).select("-__v")
		.exec().then(function (workspace) {
			if (workspace) {
				let obj = {
					user: user,
					level: level,
					disable: false,
				}
				workspace.addUser(obj)
					.then((users) => {
						res.send({ status: 1, users });
					})
			} else {
				res.send({ status: 0, message: "workspace not found" });
			}
		})
		.catch(function (err) {
			res.send({ status: 0, message: err.message });
		});
}

exports.getFeeds = async function (req, res, next) {
	let feeds = await Notification.find({ workspace: req.params.name }).exec()
	res.send({ status: 1, data: feeds });
}

exports.deleteUser = function (req, res, next) {
	return false;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @
 */
exports.getDocuments = function (req, res, next) {
	Workspace.findOne({ name: req.params.name })
		.exec()
		.then(function (wspace) {
			wspace.getDocuments({})
				.then((data) => {
					res.send({ status: 1, data });
				});

		})
}


exports.getDocument = async (req, res, next) => {
	let { name, docid } = req.params;

	try {
		let workspace = await Workspace.findOne({ name }).exec();
		let document = await workspace.getDocument({ documentId: docid });
		res.send({ status: 1, data: document });
		// document = { addCategory, creator, dateCreated, documentId, enable, id, name, type }
	} catch (err) {
		next(err);
	}
}

exports.getDocumentFile = async (req, res, next) => {
	let workspace = await Workspace.findOne({ name: req.params.name }).exec()
	let fileId = workspace.documents.find(item => item._id == req.params.docid).fsId

	var bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
	var downloadstream = bucket.openDownloadStream(mongoose.Types.ObjectId(fileId));
	downloadstream.on('error', function (error) {
		console.log("something happen on downoadstream");
		next(error);
	});

	downloadstream.pipe(res)
		.on('error', function (error) {
			console.log("terjadi error");
			next(err);
		})
		.on('finish', function () {
			console.log('done!');
		});
}

exports.updateDocument = async function (req, res, next) {
	let doc = await mongoose.model('workspace').findOne({ name: req.params.name }).exec();
	let docDetail = await doc.getDocument(req.body.name);

	let updatedDoc = docDetail[0].document;
	updatedDoc.name = "percobaan sekali lagi";

	Workspace.findOne({ name: req.params.name })
		.exec()
		.then(function (wspace) {
			wspace.updateDocument(updatedDoc)
				.then((d) => {
					res.send({ status: 0, message: "API not ready yet" })
				})
		})
}

exports.addComment = async (req, res, next) => {
	try {
		let comment = new Comment(req.body);
		await comment.save()
		res.send(req.body)
	} catch (error) {
		res.send({ status: 0, message: error.message })
	}
}

exports.getComments = async (req, res, next) => {
	try {
		let { docid } = req.params;
		let comments = await Comment.find({ documentId: docid }).exec();
		console.log(docid);
		res.send({ status: 1, data: comments })
	} catch (error) {
		res.send({ status: 0, message: error.message })
	}
}