const Notification = require('../../models/notification-model');

exports.putNotification = async (req, res, next) => {
    let notification = new Notification(req.body);
    try {
        await notification.save();
        return res.send({ status: 1, notification });
    } catch (error) {
        return next(error);
    }
}

exports.getNotification = async (req, res, next) => {
    let { username: receiver } = req.params;

    let notifications = await Notification.find({ receiver, type: Notification.notifType().ACTION }).sort({ _id: -1 }).exec();
    res.send({ status: 1, notifications })
}