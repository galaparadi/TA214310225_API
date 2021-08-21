const mongoose = require('mongoose');
const stream = require('stream');
const { google } = require('googleapis');
const { google: keys } = require('../config/keys')

exports.downloadFromDrive = async ({ accessToken, refreshToken, fileId }) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            keys.clientID,
            keys.clientSecret,
            "http://localhost/u/auth/google/redirect");

        oAuth2Client.setCredentials({
            // access_token: accessToken,
            refresh_token: refreshToken,
            // ---- this field is optional ----
            // refresh_token: "1//0gNWD0osXDQXrCgYIARAAGBASNwF-L9IrANYwG758VMCXLz-0Z9uGj0qAat_Y4Kh8yyVYKNZx3gzVLnCWXM9onmHuAuV9lYB8M0s",
            // expiry_date:1605632593449,
            scope: "https://www.googleapis.com/auth/drive.file",
            // token_type:"Bearer"
        });

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        const response = await drive.files.export({ fileId, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, { responseType: 'stream' })
        return response;
    } catch (error) {
        console.log(error)
        return undefined
    }
}

exports.writeDocumentFileFromGdrive = ({ body, fileBuffer, metadata }) => {
    return new Promise((res, rec) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let id = mongoose.Types.ObjectId();

        fileBuffer.pipe(bucket.openUploadStreamWithId(id, body.filename, { metadata }))
            .on('finish', () => {
                res({ status: 1, id });
            })
            .on('error', (error) => {
                console.log("terjadi error tak terduga");
                rec({ error })
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

/**
 * 
 * @param {Object} param0 { body: {filename}, file:{buffer}, metadata}
 * @returns {Promise} Promise<{status, id, error}>
 */
exports.writeDocumentFile = ({ body, fileBuffer, metadata }) => {
    return new Promise((resolve, reject) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let id = mongoose.Types.ObjectId();

        let bufferstream = new stream.PassThrough();
        bufferstream.end(fileBuffer);
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