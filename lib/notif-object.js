let User = require('../models/user-model');
let Notification = require('../models/notification-model');

module.exports = {
    io: {},
    sendNotif: async function (notif) {
        let notification = new Notification(notif);
        await notification.save();
        this.io.in(notif.workspace).emit('notification', notif);
    },
    retrieveNotif: async function (user) {
        console.log(`${user} user accepted`);
        let notification = await Notification.find().exec();
        return notification;
    },
    setIoConnection: function() {
        this.io.on('connection', async (socket) => {
            let user =  await User.findOne({username: socket.handshake.query.username});
            let {workspaces} = await user.getWorkspaces();
            workspaces.forEach(wp => {
                socket.join(wp.name);
            })
        });
    },
};