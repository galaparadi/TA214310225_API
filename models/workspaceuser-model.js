const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const workspaceUserSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'user' },
	level: Number,
	disable: Boolean
}, { _id: false })

// level : 

workspaceUserSchema.methods.populateUser = async function () {
	return await this.populate('user').execPopulate()
}

workspaceUserSchema.methods.changeLevel = function (userid) {

}

workspaceUserSchema.methods.toogleDisable = function () {

}

const WorkspaceUser = mongoose.model('workspaceuser', workspaceUserSchema);

module.exports = WorkspaceUser;