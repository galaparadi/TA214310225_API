const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const stream = require('stream');
const Document = require('../models/document-model');
const Workspace = require('../models/workspace-model');
var mongoose = require('mongoose');

router.post('/', upload.single('file'), (req,res) => {
    let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    let id = mongoose.Types.ObjectId();
    
    let bufferstream = new stream.PassThrough();
	bufferstream.end(req.file.buffer);
	bufferstream.on('error', () => {
		console.log("something error on bufferstream");
		next(err);
	})

	bufferstream.pipe(bucket.openUploadStreamWithId(id,req.body['filename'],{metadata : "dudung"}))
	.on('finish', () => {
		let doc = new Document({fsId : id,name: req.body['filename'],author:req.body.author});
		
		Workspace.findOne({name:req.body.workspace})
		.exec()
		.then(function(wp){	
			wp.addDocument(doc);
			res.json({message:'sukses'})
		})
		.catch(function(err) {
			next(err);
		});
	})
	.on('error', () => {
        res.status(500).json({message: 'error'})
		console.log("terjadi error tak terduga");
	})
});

router.get('/', (req,res) => {
    res.send('hallo');
});

module.exports = router;