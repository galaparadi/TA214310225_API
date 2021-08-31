const User = require('../../models/user-model');
const Notification = require('../../models/notification-model');
const mongoose = require('mongoose');

exports.getFeeds = async function (req, res, next) {
	let user = await User.findOne({ username: req.params.username }).exec();
	let workspaces = (await user.getWorkspaces()).workspaces.map(workspace => workspace.name);

	Notification.find({ workspace: { $in: workspaces }, type: Notification.notifType().FEED }).sort({ dateCreated: -1 }).exec()
		.then(feeds => {
			res.json({ status: 1, feeds })
		})
		.catch(err => {
			console.log(err.message);
			res.json({ status: 0, message: err.message })
		})
}

exports.getUsers = function (req, res, next) {
	User.find().exec()
		.then(data => {
			res.json(data);
		})
		.catch(err => {
			res.status(500).json(err);
		});
}

exports.addUser = function (req, res) {
	User.create(req.body.user, (err, user) => {
		if (err) {
			console.log(err);
			return res.status(500).send({ status: 0, message: err.message });
		}
		res.send({ status: 1, user });
	})
}

exports.getUser = function (req, res, next) {
	User.findOne({ username: req.params.username }).select("-password -googleAccount -notifications -__v")
		.exec()
		.then(function (user) {
			if (user) {
				res.send({ status: 1, user: user });
			} else {
				res.status(404).send({ status: 0, message: "not found" });
			}
		})
		.catch(function (err) {
			res.status(500).send({ status: 0, message: err.message });
		})
}

exports.getWorkspaces = function (req, res, next) {
	User.findOne({ username: req.params.username }).select("-password -googleAccount -notifications -_id -__v")
		.exec()
		.then(function (user) {
			user.getWorkspaces()
				.then(function (data) {
					res.send({ status: 1, workspaces: data.workspaces });
				})
		})
		.catch(function (err) {
			res.status(500).send({ status: 0, message: err.message });
		})
}

exports.updateUser = function (req, res, next) {
	User.updateOne({ username: req.body.username }, req.body)
		.exec()
		.then(function (data) {
			res.send({ status: 1 });
		})
		.catch(err => {
			res.status(500).send({ status: 0, message: err.message });
		})
}

exports.deleteUser = function (req, res) {
	User.deleteOne({ username: req.params.username })
		.exec()
		.then(data => {
			let dataPayload = {
				status: 1
			}
			if (data.n < 1) {
				dataPayload.status = 0;
				dataPayload.message = "No data deleted, posibly no username exist";
			}
			res.send(dataPayload);
		})
		.catch(err => {
			res.status(500).send({ status: 0, message: err.message });
		});
}

exports.getFeed = async function (req, res) {
	try {
		let notif = await Notification.find({ workspace: req.body.workspace })

		let feeds = await getFeed();
		res.send({ status: 1, feeds });
	} catch (error) {
		res.status(500).send({ status: 0, message: error.message })
	}
}