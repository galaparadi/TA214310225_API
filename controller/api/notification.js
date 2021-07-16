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