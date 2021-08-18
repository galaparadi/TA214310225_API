const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const fileSchema = new Schema({}, { collection: 'fs.files' });

const File = mongoose.model('file', fileSchema);

module.exports = File;