const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GDriveStrategy = require('passport-google-drive').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
  new GDriveStrategy({
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/u/auth/gdrive/redirect',
  },(accessToken, refreshToken, profile, done) => {
    console.log("mambo");
    console.log({accessToken, refreshToken})
    return done(null, profile);
  })
);

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/u/auth/google/redirect',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    }, (accessToken, refreshToken, profile, done) => {
        // ---------- check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user\
                return done(null, currentUser, {registered: true});
            } else {
                // if not, create user in our db
                let uname = profile.emails[0].value.split('@');
                let newUser = new User({
                    googleId: profile.id,
                    username: uname[0],
                    email: profile.emails[0].value,
                    googleAccount: true
                })

                return done(null, newUser, {registered: false});
            }
        });
    })
);

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Username tidak ditemukan'});
      }
      if (!(password===user.password)) {
        return done(null, false, { message: 'Password Salah'});
      }
      return done(null, user);
    });
  }
));