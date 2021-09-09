const fsHelper = require('../lib/fs-helper.js');

const writer = {
    'google': async (param) => {
        let { accessToken, refreshToken, fileId, mimeType, metadata, filename } = param;
        let response = await fsHelper.downloadFromDrive({ accessToken, refreshToken, fileId, mimeType });
        return await fsHelper.writeDocumentFileWithStream({ filename, fileStream: response.data, metadata });
    },
    'dropbox': async (param) => {
        let { accessToken, fileId, metadata, filename } = param;
        let response = await fsHelper.downloadFromDropbox({ accessToken, path: fileId });
        return await fsHelper.writeDocumentFileWithStream({ filename, fileStream: response, metadata });
    },
    'file': async (param) => {
        let { fileBuffer, metadata, filename } = param;
        return await fsHelper.writeDocumentFile({ filename, fileBuffer, metadata });
    },
}

/**
 * 
 * @param {String} uploadMethod 
 * @param {Object} body 
 * @param {String} body.accessToken
 * @param {String} body.filename
 * @param {String} body.fileId
 * @param {String} body.mimeType
 * @param {String} body.fileBuffer
 * @param {Object} body.metadata
 * @param {Number} body.metadata.version
 * @returns {Promise<{status, id}>} Return status and id of the fs.files _id
 */
exports.fsWriter = async (uploadMethod, body) => {
    if (writer[uploadMethod]) {
        let result = await writer[uploadMethod](body);
        return result;
    } else {
        throw new Error('upload method not implemented')
    }
}