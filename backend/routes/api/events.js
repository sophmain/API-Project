const express = require('express');

const { requireAuth, attendanceAuth, eventOrganizerOrCohost } = require('../../utils/auth');
const { Group, Membership, User, Attendance, Venue, Event, EventImage } = require('../../db/models');

const { dateValidateEvent, validateEvent, validateQuery } = require('../../utils/validation');
const { DATE } = require('sequelize');

const router = express.Router();

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
        next(err)
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
    return res.json({
        id: attendanceExists.id,
        eventId: attendanceExists.eventId,
        userId: attendanceExists.userId,
        status: attendanceExists.status
    })
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
    const eventToEdit = await Event.findByPk(eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })
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

    return res.json({
        id: eventToEdit.id,
        groupId: eventToEdit.groupId,
        venueId: eventToEdit.venueId,
        name: eventToEdit.name,
        type: eventToEdit.type,
        capacity: eventToEdit.capacity,
        price: eventToEdit.price,
        description: eventToEdit.description,
        startDate: eventToEdit.startDate,
        endDate: eventToEdit.endDate
   })
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
    //see if user already has an attendance for this event
    const isAttending = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: user.id,
            status: 'attending'
        }
    })
    const isPending = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: user.id,
            status: 'pending'
        }
    })

    //check if they are a member of the group hosting this event
    if (!isMember || isMember.status == 'pending') {
        const err = new Error('Must be a member of the group to attend this event')
        err.title = 'Forbidden'
        err.errors = 'Forbidden'
        err.status = 403
        next(err)
    }
    //if they are already an acccepted attendee
    if (isAttending){
        const err = new Error("User is already an attendee of the event")
        err.status = 400
        next(err)
    }
    //if they are a member, and they dont have a pending attendance, proceed
    if (isMember && !isPending) {
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
            model: Venue,
            attributes: {
                exclude: ['groupId', 'createdAt', 'updatedAt']
            }
        },
        {
            model: EventImage,
            attributes: {
                exclude: ['eventId', 'createdAt', 'updatedAt']
            }
        },
        {
            model: Group,
            attributes: {
                exclude: ['organizerId', 'about', 'type', 'createdAt', 'updatedAt']
            }
        },
        {
            model: Attendance
        }],
        attributes: {
            exclude: ['createdAt', 'updatedAt']

        }
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
router.get('/', validateQuery, async (req, res, next) => {
    let { page, size, name, type, startDate } = req.query


    page = parseInt(page)
    size = parseInt(size)

    if (Number.isNaN(page)) page = 1;
    if (Number.isNaN(size)) size = 20;

    if (size > 20) size = 20;
    if (page > 10) page = 10;

    const pagination = {}

    if (page >= 1 && size >= 1){
        pagination.limit = size;
        pagination.offset = size * (page-1)
    }
        //add fiters to where object
    const where = {}
    if (name && name !== ""){
        where.name = name
    }
    if (type && type !== ""){
        where.type = type
    }

    if (startDate && startDate !== ""){
        try{
            const date = new Date(startDate)
            const iso = date.toISOString()
            if(iso.slice(iso.length-1) !== 'Z'){
                const err = new Error("Start date must be a valid datetime")
                err.status = 400
                err.title = 'Validation error'
                next(err)
            } else {
                where.startDate = iso
            }
        } catch{
            const err = new Error("Start date must be a valid datetime")
            err.status = 400
            err.title = 'Validation error'
            next(err)
        }

    }
    const events = await Event.findAll({
        where,
        include: [
            {
                model: User
            },
            {
                model: Group,
                attributes: {
                    exclude: ['organizerId', 'about', 'type', 'private', 'createdAt', 'updatedAt']
                }
            },
            {
                model: Venue,
                attributes: {
                    exclude: ['groupId', 'address', 'lat', 'lng', 'createdAt', 'updatedAt']
                }
            },
            {
                model: EventImage
            },],
        attributes: {
            exclude: ['description', 'price', 'capacity', 'createdAt', 'updatedAt']
        },
        ...pagination
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
        err.title = 'Forbidden'
        err.errors = 'Forbidden'
        err.status = 403
        return next(err)
    }
})

//DELETE event by id
router.delete('/:eventId', requireAuth, eventOrganizerOrCohost, async (req, res, next) => {
    const { eventId } = req.params
    const eventToDelete = await Event.findByPk(eventId)
    await eventToDelete.destroy()

    res.json({
        message: "Successfully deleted"
    })
})

module.exports = router;
