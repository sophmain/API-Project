const express = require('express')

const { requireAuth } = require('../../utils/auth');
const { Group, Membership, Event, EventImage } = require('../../db/models');

const router = express.Router();


router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { imageId } = req.params
    const { user } = req

    const eventImage = await EventImage.findOne({
        where: {
            id: imageId
        }
    })
    if (!eventImage) {
        const err = new Error("Event Image couldn't be found")
        err.status = 404
        next(err)
    }

    const event = await Event.findOne({
        where: {
            id: eventImage.eventId
        }
    })
    const group = await Group.findOne({
        where: {
            id: event.groupId
        }
    })
    const coHost = await Membership.findOne({
        where: {
            groupId: group.id,
            status: 'co-host',
            userId: user.id
        }
    })

    if (user.id == group.organizerId || coHost) {
        await eventImage.destroy()
        return res.json({
            message: 'Successfully deleted'
        })
    }  else {
        const err = new Error("Must be the organizer or 'co-host' of the Group hosting this Event to delete an image")
        err.title = 'Forbidden request'
        err.errors = 'Forbidden request'
        err.status = 403
        return next(err)
    }

})

module.exports = router;
