var mongoose = require('mongoose');
const Workspace = require('../../models/workspace-model');
const stream = require('stream');
const Document = require('../../models/document-model');

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
		.catch()
}

exports.addDocument = function (req, res, next) {
	let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
	let id = mongoose.Types.ObjectId();

	let bufferstream = new stream.PassThrough();
	bufferstream.end(req.file.buffer);
	bufferstream.on('error', () => {
		console.log("something error on bufferstream");
		next(err);
		return;
	})

	bufferstream.pipe(bucket.openUploadStreamWithId(id, req.body['filename'], { metadata: "dudung" }))
		.on('finish', () => {
			let doc = new Document({ fsId: id, name: req.body['filename'], author: req.body.author });

			Workspace.findOne({ name: req.params.name })
				.exec()
				.then(function (wp) {
					wp.addDocument(doc);
					res.json({ message: 'sukses' })
				})
				.catch(function (err) {
					next(err);
					return;
				});
		})
		.on('error', () => {
			console.log("terjadi error tak terduga");
			res.status(500).json({ message: 'error' })
		})
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

exports.putUser = function (req, res, next) {
	Workspace.findOne({ name: req.params.name }).select("-__v")
		.exec().then(function (workspace) {
			if (workspace) {
				let obj = {
					user: req.body.user,
					level: req.body.level,
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

exports.deleteUser = function (req, res, next) {
	return false;
}

exports.getDocuments = function (req, res, next) {
	Workspace.findOne({ name: req.params.name })
		.exec()
		.then(function (wspace) {
			wspace.getDocuments()
				.then((data) => {
					res.send({ status: 1, data });
				});

		})
}

exports.getDocument = async (req, res, next) => {
	try {
		let workspace = await Workspace.findOne({ name: req.params.name }).exec();
		let document = await workspace.getDocument(req.params.docid);
		res.send({ status: 1, data: document });
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