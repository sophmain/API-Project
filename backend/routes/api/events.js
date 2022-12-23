const express = require('express');

const { setTokenCookie, requireAuth, userAuthorize, attendanceAuth, eventOrganizerOrCohost } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Attendance, Venue, Event, EventImage, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors, dateValidateEvent, validateEvent } = require('../../utils/validation');
const { route } = require('./session');
const event = require('../../db/models/event');

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

//PUT change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, eventOrganizerOrCohost, async (req, res, next) => {
    const { eventId } = req.params
    const { user } = req
    const { userId, status } = req.body
    const findEvent = await Event.findByPk(eventId)
    if (!findEvent) {
        const err = new Error("Event couldn't be found")
        err.status = 404
        next(err)
    }
    if (status == 'pending') {
        const err = new Error("Cannot change an attendance status to pending")
        err.status = 400
    }
    //see if current user does not have attendance (nothing to change)
    const attendanceExists = await Attendance.findOne({
        where: {
            eventId: findEvent.id,
            userId: user.id
        }
    })
    if (!attendanceExists) {
        const err = new Error("Attendance between the user and the event does not exist")
        err.status = 404
        next(err)
    }
    await attendanceExists.update({
        userId: userId,
        status: status
    })
    return res.json(attendanceExists.id)
})
//PUT edit an event specified by its id
router.put('/:eventId', requireAuth, eventOrganizerOrCohost, dateValidateEvent, validateEvent, async (req, res, next) => {
    const { eventId } = req.params
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    const findVenue = await Venue.findOne({
        where: {
            id: venueId
        }
    })

    if (!findVenue) {
        const err = new Error("Venue couldn't be found")
        err.errors = `Couldn't find a venue with the specified id`
        err.status = 404
        return next(err)
    }
    const eventToEdit = await Event.findByPk(eventId)
    await eventToEdit.update({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })
    return res.json(eventToEdit)
})
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

//POST request to attend an event based on the events Id
router.post('/:eventId/attendance', requireAuth, async (req, res, next) => {
    const { eventId } = req.params
    const { user } = req
    const event = await Event.findOne({
        where: {
            id: eventId
        }
    })
    if (!event) {
        const err = new Error("Event couldn't be found")
        err.status = 404;
        next(err)
    }
    const group = await Group.findOne({
        where: {
            id: event.groupId
        }
    })
    const isMember = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id
        }
    })
    //see if user already has a pending attendance for this event
    const attendanceCheck = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: user.id,
            status: 'pending'
        }
    })
    //check if they are a member of the group hosting this event
    if (!isMember) {
        const err = new Error('Must be a member of the group to attend this event')
        err.title = 'Forbidden request'
        err.errors = 'Forbidden request'
        err.status = 403
        next(err)
    }
    //if they are a member, and they dont have a pending attendance, proceed
    if (isMember && !attendanceCheck) {
        const newAttendance = await event.createAttendance({
            userId: user.id,
            status: 'pending'
        })
        return res.json({
            userId: newAttendance.userId,
            status: newAttendance.status
        })
    } else {
        const err = new Error("Attendance has already been requested")
        err.status = 400
        next(err)
    }
})

//GET all attendees of an event specified by its id
router.get('/:eventId/attendees', async (req, res, next) => {
    const { eventId } = req.params
    const { user } = req
    const event = await Event.findOne({
        where: {
            id: eventId
        }
    })
    if (!event) {
        const err = new Error("Event couldn't be found")
        err.errors = `Couldn't find a event with the specified id`
        err.status = 404
        return next(err)
    }
    const group = await Group.findOne({
        where: {
            id: event.groupId
        }
    })
    const coHost = await Membership.findOne({
        where: {
            groupId: event.groupId,
            status: 'co-host',
            userId: user.id
        }
    })
    const allAttendees = await Attendance.findAll({
        include: {
            model: User
        },
        where: {
            eventId: event.id
        }
    })
    let attendanceList = []
    allAttendees.forEach(attendee => {
        if (attendee.status != 'not-attending') {
            attendanceList.push(attendee.toJSON())
        }
    })

    let Attendees = []
    attendanceList.forEach(attendee => {
        let attendeeInfo = {
            id: attendee.User.id,
            firstName: attendee.User.firstName,
            lastName: attendee.User.lastName,
            Attendance: {
                status: attendee.status
            }
        }
        Attendees.push(attendeeInfo)
    })
    const attendeeObj = { "Attendees": Attendees }
    if (user.id == group.organizerId || coHost) {
        res.json(attendeeObj)
    } else {
        let notPending = []
        Attendees.forEach(attendee => {
            if (attendee.Attendance.status != 'pending') {
                notPending.push(attendee)
            }
        })
        const notPendingObj = { "Attendees": notPending }

        res.json(notPendingObj)
    }
})
//GET details of an event specified by its id
router.get('/:eventId', async (req, res, next) => {
    const { eventId } = req.params
    const event = await Event.findByPk(eventId, {
        include: [{
            model: Venue
        },
        {
            model: EventImage
        },
        {
            model: Group
        },
        {
            model: Attendance
        }]
    })

    if (!event) {
        const err = new Error("Event couldn't be found")
        err.status = 404
        next(err)
    }
    let count = 0;

    let jsonEvent = event.toJSON()

    jsonEvent.Attendances.forEach(member => {
        if (member) {
            count++
            jsonEvent.numAttending = count
        }
    })
    if (!jsonEvent.Attendances.length) {
        jsonEvent.numAttending = 0;
    }

    delete jsonEvent.Attendances

    return res.json(jsonEvent)
})
//GET all events
router.get('/', async (req, res) => {
    let { page, size } = req.query

    page = parseInt(page)
    size = parseInt(size)

    if (Number.isNaN(page)) page = 1;
    if (Number.isNaN(size)) size = 20;

    if (size > 20) size = 20;
    if (page > 10) page = 10;
    console.log('PAGE AND SIZE', page, size)
    const pagination = {}

    if (page >= 1 && size >= 1){
        pagination.limit = size;
        pagination.offset = size * (page-1)
    }
    const where = {}
    const events = await Event.findAll({
        include: [
            {
                model: User
            },
            {
                model: Group
            },
            {
                model: Venue
            },
            {
                model: EventImage
            },],
        attributes: {
            exclude: ['description', 'price', 'capacity']
        },
        ...pagination
    })
    let eventsList = []
    events.forEach(event => {
        eventsList.push(event.toJSON())
    })

    console.log('PAGINATION',pagination)
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

//DELETE attendance to an event specified by id
router.delete('/:eventId/attendance', requireAuth, async (req, res, next) => {
    const { eventId } = req.params
    const { user } = req
    const { userId } = req.body
    const event = await Event.findByPk(eventId)
    if (!event) {
        const err = new Error("Event couldn't be found")
        err.status = 404
        next(err)
    }
    const group = await Group.findOne({
        where: {
            id: event.groupId
        }
    })
    if (userId == user.id || group.organizerId == user.id) {
        const attendanceToDelete = await Attendance.findOne({
            where: {
                eventId: event.id,
                userId: user.id
            }
        })
        if (!attendanceToDelete) {
            const err = new Error("Attendance does not exist for this User")
            err.status = 404
            next(err)
        }
        await attendanceToDelete.destroy()
        return res.json({
            message: 'Successfully deleted attendance from event'
        })
    }
    if (userId != user.id && group.organizerId != user.id) {
        const err = new Error("Only the User or organizer may delete an Attendance")
        err.status = 403
        next(err)
    }
})

//DELETE event by id
router.delete('/:eventId', requireAuth, eventOrganizerOrCohost, async (req, res, next) => {
    const { eventId } = req.params
    const { user } = req
    const eventToDelete = await Event.findByPk(eventId)
    await eventToDelete.destroy()
    res.json({
        message: "Successfully deleted"
    })
})

module.exports = router;
