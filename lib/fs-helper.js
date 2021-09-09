const mongoose = require('mongoose');
const stream = require('stream');
const { google } = require('googleapis');
const { google: keys } = require('../config/keys');
const { Dropbox } = require('dropbox');

exports.downloadFromDropbox = async ({ accessToken, path }) => {
    let dbx = new Dropbox({ accessToken });
    let response = await dbx.filesDownload({ path });
    let bufferstream = new stream.PassThrough();
    bufferstream.end(response.result.fileBinary);
    bufferstream.on('error', (error) => {
        console.log("something error on bufferstream");
        throw error;
    });

    return bufferstream;
}

exports.uploadToDropbox = async ({ accessToken, path, fsid }) => {
    let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    let downloadstream = bucket.openDownloadStream(mongoose.Types.ObjectId(fsid));
    downloadstream.on('error', function (error) {
        console.log("something happen on downoadstream");
        console.log(error);
        next(error);
    });

    let chunks = []
    for await (let chunk of downloadstream) {
        chunks.push(chunk)
    }
    let contents = Buffer.concat(chunks);

    let dbx = new Dropbox({ accessToken });
    let response = await dbx.filesUpload({ strict_conflict: false, mute: false, mode: 'add', autorename: true, path, contents });
    return response;
}

exports.downloadFromDrive = async ({ accessToken, refreshToken, fileId, mimeType }) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            keys.clientID,
            keys.clientSecret,
            "http://localhost/u/auth/google/redirect");

        oAuth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
            // ---- this field is optional ----
            // refresh_token: "1//0gNWD0osXDQXrCgYIARAAGBASNwF-L9IrANYwG758VMCXLz-0Z9uGj0qAat_Y4Kh8yyVYKNZx3gzVLnCWXM9onmHuAuV9lYB8M0s",
            // expiry_date:1605632593449,
            scope: "https://www.googleapis.com/auth/drive.file",
            // token_type:"Bearer"
        });

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        if (mimeType.includes('vnd.google-apps')) {
            const response = await drive.files.export({ fileId, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, { responseType: 'stream' })
            return response;
        } else {
            const responseFile = await drive.files.get({ alt: 'media', fileId, mimeType });
            let fileBuffer = new stream.PassThrough();
            fileBuffer.end(responseFile.data);
            fileBuffer.on('error', (error) => {
                console.log("something error on bufferstream");
                reject({ error });
            })

            responseFile.data = fileBuffer;
            return responseFile;
        }
    } catch (error) {
        console.log(error)
        throw error;
    }
}

exports.writeDocumentFileWithStream = ({filename, fileStream, metadata}) => {
    return new Promise((resolve, reject) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let id = mongoose.Types.ObjectId();

        fileStream.pipe(bucket.openUploadStreamWithId(id, filename, { metadata }))
            .on('finish', () => {
                resolve({ status: 1, id });
            })
            .on('error', (error) => {
                console.log("terjadi error tak terduga");
                reject(error)
            });
    });
}

/**
 * 
 * @param {Object} param0 { filename: String, file:{buffer}, metadata}
 * @returns {Promise} Promise<{status, id, error}>
 */
exports.writeDocumentFile = ({ filename, fileBuffer, metadata }) => {
    return new Promise((resolve, reject) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let id = mongoose.Types.ObjectId();

        let bufferstream = new stream.PassThrough();
        bufferstream.end(fileBuffer);
        bufferstream.on('error', (error) => {
            console.log("something error on bufferstream");
            reject({ error });
        })

        bufferstream.pipe(bucket.openUploadStreamWithId(id, filename, { metadata }))
            .on('finish', () => {
                resolve({ status: 1, id });
            })
            .on('error', (error) => {
                console.log("terjadi error tak terduga");
                reject(error)
            });
    });
}

exports.writeDocumentFileFromGdrive = ({ body, fileBuffer, metadata }) => {
    return new Promise((res, rej) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let id = mongoose.Types.ObjectId();

        fileBuffer.pipe(bucket.openUploadStreamWithId(id, body.filename, { metadata }))
            .on('finish', () => {
                res({ status: 1, id });
            })
            .on('error', (error) => {
                console.log("terjadi error tak terduga : " + error.message);
                rej(error)
            });
    })
}

exports.uploadToGDrive = async ({ fsid, document, accessToken, refreshToken }) => {
    let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    let downloadstream = bucket.openDownloadStream(mongoose.Types.ObjectId(fsid));
    downloadstream.on('error', function (error) {
        console.log("something happen on downoadstream");
        console.log(error);
        next(error);
    });

    const oAuth2Client = new google.auth.OAuth2(
        keys.clientID,
        keys.clientSecret,
        "http://localhost/u/auth/google/redirect");

    oAuth2Client.setCredentials({
        refresh_token: refreshToken,
        // ---- this field is optional ----
        // refresh_token: "1//0gNWD0osXDQXrCgYIARAAGBASNwF-L9IrANYwG758VMCXLz-0Z9uGj0qAat_Y4Kh8yyVYKNZx3gzVLnCWXM9onmHuAuV9lYB8M0s",
        // expiry_date:1605632593449,
        scope: "https://www.googleapis.com/auth/drive.file",
        // token_type:"Bearer"
    });

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const response = await drive.files.create({
        requestBody: {
            name: "jojo",
        },
        media: {
            body: downloadstream,
        }
    })
    return response;
}

exports.readDocumentFile = async ({ fsid, res }) => {
    var bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    var downloadstream = bucket.openDownloadStream(mongoose.Types.ObjectId(fsid));
    downloadstream.on('error', function (error) {
        console.log("something happen on downoadstream");
        console.log(error);
        next(error);
    });

    res.type('application/vnd.google-apps.document')
    downloadstream.pipe(res)
        .on('error', function (error) {
            console.log("terjadi error");
            next(err);
        })
        .on('finish', function () {
            console.log('done!');
        });
}