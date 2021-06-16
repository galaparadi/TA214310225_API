const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Document = require('./document-model');
var ObjectId = mongoose.Schema.Types.ObjectId;

const categorySchema = new Schema({
    name: {type: String},
    parent: Schema.Types.ObjectId,
    level : Number,
});

const category = mongoose.model('category', categorySchema);

module.exports = category;