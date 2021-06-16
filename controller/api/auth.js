var mongoose = require('mongoose');
const User = require('../../models/user-model');
var express = require('express');

exports.googleAuth = (req, res, next) => {
  User.findOne({ googleId: req.body.googleId }).exec()
    .then(user => {
      if (user) {
        res.send({ status: 1, message: "authorized", user: user });
      } else {
        res.status(404).send({ status: 0, message: "not found" });
      }
    })
    .catch(err => {
      res.status(500).send({ status: 0, message: err.message });
    });
}

exports.userAuth = (req, res, next) => {
  User.findOne({ username: req.body.user.username }).exec()
    .then(user => {
      if (user) {
        if (user.password !== req.body.user.password) {
          res.send({ status: 0, message: "not authorized" });
        } else {
          res.send({ status: 1, message: "authorized", user: user });
        }
      } else {
        res.status(404).send({ status: 0, message: "not found" });
      }
    })
    .catch(err => {
      res.status(500).send({ status: 0, message: err.message });
    });
}
