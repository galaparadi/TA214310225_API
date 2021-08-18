var mongoose = require('mongoose');
const stream = require('stream');

/**
 * 
 * @param {Object} param0 { body, file, metadata}
 * @returns {Promise} Promise<{status, id, error}>
 */
exports.writeDocumentFile = ({ body, file, metadata }) => {
    return new Promise((resolve, reject) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let id = mongoose.Types.ObjectId();

        let bufferstream = new stream.PassThrough();
        bufferstream.end(file.buffer);
        bufferstream.on('error', (error) => {
            console.log("something error on bufferstream");
            reject({ error });
        })

        bufferstream.pipe(bucket.openUploadStreamWithId(id, body.filename, { metadata }))
            .on('finish', () => {
                resolve({ status: 1, id });
            })
            .on('error', (error) => {
                console.log("terjadi error tak terduga");
                reject({ error })
            });
    });
}

exports.readDocumentFile = async () => {
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