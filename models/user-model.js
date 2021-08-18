const mongoose = require('mongoose');
const Notification = require('./notification-model');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
	username: { type: String, unique: true },
	password: String,
	googleId: String,
	thumbnail: String,
	email: String,
	googleAccount: Boolean,
	workspaces: [{ type: Schema.Types.ObjectId, ref: 'workspace' }],
	notifications: [Schema.Types.ObjectId]
});

userSchema.methods.getWorkspaces = function () {
	return this.populate("workspaces", "name").execPopulate();
}

userSchema.methods.addWorkspaces = function (id) {
	var workspaces = this.workspaces;
	workspaces.push(mongoose.Types.ObjectId(id));
	return this.save();
}

userSchema.methods.deleteWorkspaces = function (workspace, cb) {
	console.log(this.workspaces);
	let i = this.workspaces.indexOf(mongoose.Types.ObjectId(workspace));
	this.workspaces.splice(i, 1);
	console.log(this.workspaces);
	cb();
}

userSchema.methods.addNotification = function (data) {
	var notif = this.notifications;
	notif.push(new Notification(data));
	this.save(function (err, user) {
		if (err) {
			return err;
		}
	});
}

userSchema.methods.updateNotification = function (argument) {

}

userSchema.statics.isExist = function (name, cb) {
	return this.findOne({ username: name }, cb)
}

const User = mongoose.model('user', userSchema);

module.exports = User;
