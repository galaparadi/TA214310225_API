var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
var logger = require('morgan');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const bearerMid = require('express-bearer-token');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bearerMid());

//set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));


mongoose.connect(keys.mongodb.dbURI, {useNewUrlParser: true, useCreateIndex : true, useUnifiedTopology: true}, () => {
    console.log('\x1b[33m%s\x1b[0m', 'connected to mongodb');
});

app.use('/sandbox', require('./routes/sandbox'));
app.use('/users', require('./routes/users'));
app.use('/workspaces', require('./routes/workspace'));
app.use('/token', require('./routes/token'));
app.use('/test', require('./routes/dummy'))
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //console.log('error catched');
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  res.status(err.status || 500).json({message: "Something wrong, please look at console", status: 0});
});

module.exports = app;
