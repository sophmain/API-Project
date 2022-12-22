const express = require('express');

const { setTokenCookie, requireAuth, userAuthorize, attendanceAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Attendance, Venue, Event, EventImage, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { route } = require('./session');

const router = express.Router();

const validateVenue = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check('lat')
        .exists({ checkFalsy: true })
        .withMessage("Latitude is not valid"),
    check('lng')
        .exists({ checkFalsy: true })
        .withMessage("Longitute is not valid"),
    handleValidationErrors
]

//POST add an image to a event based on the events id
router.post('/:eventId/images', requireAuth, attendanceAuth, async (req, res, next) => {
    const { eventId } = req.params
    const { url, preview } = req.body
    const eventAddImage = await Event.findByPk(eventId)
    const eventImage = await eventAddImage.createEventImage({
        url,
        preview
    })
    return res.json({
        id: eventImage.id,
        url: eventImage.url,
        preview: eventImage.preview
    })
})
//GET all events
router.get('/', async (req, res) => {
    const events = await Event.scope('defaultScope').findAll({
        include: [
            {
                model: User
            },
            {
                model: Group.scope(['defaultScope', 'hideDetails'])
            },
            {
                model: Venue.scope(['hideDetails', 'defaultScope'])
            },
            {
                model: EventImage
            },],
        attributes: {
            exclude: ['description', 'price', 'capacity']
        }
    })
    let eventsList = []
    events.forEach(event => {
        eventsList.push(event.toJSON())
    })
    eventsList.forEach(event => {
        let count = 0;
        event.Users.forEach(user => {
            if (user) {
                count++
                event.numAttending = count
            }
        })
        if (!event.Users.length) {
            event.numAttending = 0;
        }

        event.EventImages.forEach(image => {
            //console.log('groupid', group.id, image.groupId)
            if (image.eventId == event.id && image.preview == true) {
                event.previewImage = image.url
            }
        })
        if (!event.previewImage) {
            event.previewImage = 'No event image found'
        }
        if (!event.Venue) {
            event.Venue = 'Null'
        }
        delete event.EventImages
        delete event.Users
    })
    let Events = { "Events": eventsList }
    return res.json(Events)
})

module.exports = router;
