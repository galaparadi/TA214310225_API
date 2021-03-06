const express = require('express');
const Notification = require('../models/notification-model');
const router = express.Router();

router.post('/', async (req, res) => {
    res.status(501).send('not implemented')
})
    .get('/', (req, res, next) => {

    })

router.put('/:id/action', async (req, res) => {
    try {
        let notif = await Notification.findById(req.params.id).exec()
        let { message, status } = await notif.executeAction();
        if (status === 0) throw new Error();
        
        if (notif.content.action === Notification.notifAction().ADD_DOCUMENT) {
            await Notification.pushNotif({
                initiator: notif.initiator,
                workspace: notif.workspace,
                type: Notification.notifType().FEED,
                content: {
                    message: `${notif.initiator} menambahkan dokumen ${notif.content.data.document.name}`
                }
            })
        } else if (notif.content.action === Notification.notifAction().ADD_NEW_VERSION) {
            await Notification.pushNotif({
                initiator: notif.initiator,
                workspace: notif.workspace,
                type: Notification.notifType().FEED,
                content: {
                    message: `${notif.initiator} menambahkan dokumen ${notif.content.data.document.name}`
                }
            });
        }
        
        notif.statusRead = true;
        await notif.save();
        res.send({ status: 1, message });
    } catch (error) {
        console.log(error);
        res.send({ status: 0 });
    }
})

router.get('/:id', async (req, res) => {
    try {
        let notif = await Notification.findById(req.params.id).exec();
        res.send({ status: 1, data: notif })
    } catch (error) {
        res.send({ status: 0, message: error.message })
    }
})


module.exports = router;