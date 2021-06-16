const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const workspaceUserSchema = new Schema({
	user : {type: Schema.Types.ObjectId, ref: 'user'},
	level : Number,
	disable : Boolean
})

// level : 

workspaceUserSchema.methods.populateUser = function(cb) {
	this.populate('user',function(err,wpuser){
		console.log(wpuser);
		return wpuser;
	})
}

workspaceUserSchema.methods.changeLevel = function(userid) {
	
}

workspaceUserSchema.methods.toogleDisable = function() {
	
}

const WorkspaceUser = mongoose.model('workspaceuser', workspaceUserSchema);

module.exports = WorkspaceUser;