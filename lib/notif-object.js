module.exports = {
    io: {},
    sendNotif: function(notif) {
        this.io.emit('notification',notif);
    },
    retrieveNotif: function(user) {
        console.log(`${user} user accepted`)
    },
    getIo: function(){
        return this.io;
    }
};