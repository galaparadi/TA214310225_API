var express = require('express');
var router = express.Router();
// const Notification = require('../models/notification-model');
// let notif = require('../lib/notif-object');

router.get('/:name/id/:id', async (req,res) => {
    let wp = require('../models/workspace-model');
    let wpp  = await wp.findOne({name: req.params.name}).exec();
    let wowo = await wpp.getDocument();
    res.send(wowo.filter(user => user.user));
})
router.get('/notif', async (req,res) => {
    Notification.find().exec().then(data => res.json({status: 1, data}))
});
router.post('/notif', async (req,res) => {
    let notification = new Notification(req.body);
    await notification.save();
    res.json({status: 1, notification});
});
router.get('/emit-notif', async (req,res) => {
    notif.sendNotif({message: 'lolololo', workspace: 'bahas-kampus'});
    res.send('dudung');
})
router.get('/', (req,res) => res.send('aku sandbox'));
router.post('/', (req,res) => res.json(req.session.passport.user));

module.exports = router;