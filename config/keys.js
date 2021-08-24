// add this file to .gitignore

module.exports = {
        google: {
            clientID: '1031394987005-jan8sh88i4poiv7o4kuhmlehdft8ou31.apps.googleusercontent.com',
            clientSecret: '-LruvOxju0SFmtAlI7HlPhzm'
        },
        mongodb: {
            dbURI: process.env.MONGODB_URI
        },
        session: {
            cookieKey: process.env.COOKIE_SECRET
        },
        token: {
            secret: process.env.TOKEN_SECRET
        }
};
