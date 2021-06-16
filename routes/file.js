var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var express = require('express');
var multer = require('multer');
var stream = require('stream');
var keys = require('../config/keys');
var router = express.Router();
const GridFsStorage = require('multer-gridfs-storage');
var Document = require('../models/document-model');
var Workspace = require('../models/workspace-model');

const storage = multer.memoryStorage();
var upload = multer({storage: storage});

router.get('/', (req, res) => {	
	res.sendStatus(403);
});

// how to catch error when downloading
router.get('/download/:name',(req,res,next) => {
	var bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
	// var downloadstream = bucket.openDownloadStreamByName(req.params.name);
	var downloadstream = bucket.openDownloadStream(mongoose.Types.ObjectId(req.params.name));
	downloadstream.on('error', function(error){
		console.log("something happen on downoadstream");
		next(error);
	});

	downloadstream.pipe(res)
	.on('error', function(error) {
		console.log("terjadi error");
		next(err);
	})
	.on('finish', function() {
		console.log('done!');
	});
})

//belum sempurna. akan dijadikan transaction
router.post('/upload', upload.single('document'), (req, res, next) => {
	var bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
	var id = mongoose.Types.ObjectId();

	let bufferstream = new stream.PassThrough();
	bufferstream.end(req.file.buffer);
	bufferstream.on('error', () => {
		console.log("something error on bufferstream");
		next(err);
	})

	bufferstream.pipe(bucket.openUploadStreamWithId(id,req.body['filename'],{metadata : "dudung"}))
	.on('finish', () => {
		let doc = new Document({fsId : id,name: req.body['filename'],author:req.user.id});
		
		Workspace.findOne({name:req.body.workspace})
		.exec()
		.then(function(wp){	
			wp.addDocument(doc);
			res.redirect("/" + req.body.workspace);
		})
		.catch(function(err) {
			next(err);
		});
	})
	.on('error', () => {
		console.log("terjadi error tak terduga");
	})
});

module.exports = router;