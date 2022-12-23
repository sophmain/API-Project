const express = require('express');

const { setTokenCookie, requireAuth, userAuthorize } = require('../../utils/auth');
const { Group, Membership, Event, Attendance, EventImage, GroupImage, User, Venue, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors, dateValidateEvent, validateEvent, validateVenue, validateGroup } = require('../../utils/validation');
const { route } = require('./session');
const group = require('../../db/models/group');
const event = require('../../db/models/event');
const eventimage = require('../../db/models/eventimage');

const router = express.Router();

//POST request membership for a group based on the group's id
router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
    const { groupId } = req.params
    const { user } = req
    const memberId = user.id
    const group = await Group.findByPk(groupId)
    if (!group) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        return next(err);
    }
    const findMembership = await Membership.findAll({
        where: {
            groupId: groupId,
            userId: user.id,
            status: 'pending'
        }
    })
    console.log(findMembership)
    if (findMembership.length) {
        const err = new Error("Membership has already been requested");
        err.status = 400;
        return next(err);
    }
    const alreadyMember = await Membership.findAll({
        where: {
            groupId: groupId,
            userId: user.id,
            status: 'member'
        }
    })
    if (alreadyMember.length) {
        const err = new Error("User is already a member of the group");
        err.status = 400;
        return next(err);
    }
    const addMember = await group.createMembership({
        userId: memberId,
        status: 'pending'
    })
    return res.json({
        memberId: addMember.userId,
        status: addMember.status
    })
})
// POST create event for group specified by its id
router.post('/:groupId/events', requireAuth, userAuthorize, dateValidateEvent, validateEvent, async (req, res, next) => {
    const { groupId } = req.params
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    const event = await Group.findByPk(groupId)
    const newEvent = await event.createEvent({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate,
    }
    )
    return res.json({
        id: newEvent.id,
        groupId: newEvent.groupId,
        venueId: newEvent.venueId,
        name: newEvent.name,
        type: newEvent.type,
        capacity: newEvent.capacity,
        price: newEvent.price,
        description: newEvent.description,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate
    })
})
// POST image to a group
router.post('/:groupId/images', requireAuth, userAuthorize, async (req, res, next) => {
    const { groupId } = req.params
    const { url, preview } = req.body
    const { user } = req

    const group = await Group.findByPk(groupId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    if (group && group.organizerId == user.id) {
        const image = await group.createGroupImage({
            url,
            preview
        })

        return res.json({
            id: image.id,
            url: image.url,
            preview: image.preview
        })
    }
})

//POST a new venue for a group specified by its id
router.post('/:groupId/venues', requireAuth, userAuthorize, validateVenue, async (req, res, next) => {
    const { groupId } = req.params
    const { address, city, state, lat, lng } = req.body

    const newVenue = await Venue.create({
        groupId: parseInt(groupId),
        address,
        city,
        state,
        lat,
        lng
    })
    const findNewVenue = await Venue.scope('defaultScope').findByPk(newVenue.id)
    if (findNewVenue) {
        res.json(findNewVenue)
    } else {
        const err = new Error('Validation Error');
        err.status = 400;
        return next(err);
    }
})

// POST a group
router.post('/', requireAuth, validateGroup, async (req, res, next) => {
    const { user } = req
    const { name, about, type, private, city, state } = req.body

    const newGroup = await Group.create({
        organizerId: user.id,
        name,
        about,
        type,
        private,
        city,
        state
    })

    if (newGroup) {
        res.json(newGroup)
    } else {
        const err = new Error('Validation Error');
        err.status = 400;
        return next(err);
    }
})

// GET all events of a group specified by its id
router.get('/:groupId/events', async (req, res, next) => {
    const { groupId } = req.params
    const events = await Event.findAll({
        where: {
            groupId: groupId
        },
        include: [{
            model: Venue
        },
        {
            model: Group
        },
        {
            model: EventImage
        },
        {
            model: Attendance
        }]
    })
    if (!events.length) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        return next(err);
    }
    let eventsList = []

    events.forEach(event => {
        eventsList.push(event.toJSON())
    })
    //add image url and attendance
    eventsList.forEach(event => {
        let count = 0;
        event.Attendances.forEach(attendance => {
            if (attendance) {
                count++
                event.numAttending = count
            }
        })
        if (!event.Attendances.length) {
            event.numAttending = 0;
        }

        event.EventImages.forEach(image => {
            //console.log('groupid', group.id, image.groupId)
            if (image.preview == true) {
                event.previewImage = image.url
            }
        })
        if (!event.previewImage) {
            event.previewImage = 'No event image found'
        }
        delete event.EventImages
        delete event.Attendances
    })
    let Events = { "Events": eventsList }
    return res.json(Events)
})

//GET all venues for a group specified by its id
router.get('/:groupId/venues', userAuthorize, requireAuth, async (req, res, next) => {
    const { groupId } = req.params
    const venues = await Venue.findAll({
        where: {
            groupId: groupId
        }
    })
    let Venues = { 'Venues': venues }
    return res.json(Venues)
})
//GET all members of a group specified by its id
router.get('/:groupId/members', async (req, res, next) => {
    const { user } = req
    const { groupId } = req.params
    const group = await Group.findByPk(groupId)
    if (!group){
        const err = new Error("Group couldn't be found")
        err.status = 404
        next(err)
    }
    const coHost = await Membership.findOne({
        where: {
            groupId: groupId,
            status: 'co-host',
            userId: user.id
        }
    })
    const allMembers = await Membership.findAll({
        include: {
            model: User
        },
        where: {
            groupId: groupId
        }
    })
    let membersList = []
    allMembers.forEach(member => {
        membersList.push(member.toJSON())
    })
    console.log(membersList)
    let Members = []
    membersList.forEach(member=>{
        let memberInfo = {
            id: member.User.id,
            firstName: member.User.firstName,
            lastName: member.User.lastName,
            Membership: {
                status: member.status
            }
        }
        Members.push(memberInfo)
    })
    const memberObj = {"Members": Members}
    if (user.id == group.organizerId || coHost) {
        res.json(memberObj)
    } else {
        let notPending = []
        Members.forEach(member => {
            if (member.Membership.status != 'pending'){
                notPending.push(member)
            }
        })
        const notPendingObj = {"Members": notPending}
        console.log(notPending)
        res.json(notPendingObj)
    }
})
//GET all groups joined or organized by the current user
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req

    const groups = await Group.findAll({
        include: [
            {
                model: Membership,
            },
            {
                model: GroupImage
            }],
    })

    let groupsList = []

    groups.forEach(group => {
        if (group.organizerId == user.id) {
            groupsList.push(group.toJSON())
        }

        group.Memberships.forEach(membership => {
            if (membership.userId == user.id && membership.status == 'member') {
                groupsList.push(group.toJSON())
            }
        })

    })
    //remove groups where member is also organizer
    let groupIds = []
    groupsList.forEach(group => {
        if (groupIds.includes(group.id)) {
            groupsList.splice(group, 1)
        }
        groupIds.push(group.id)
    })
    // add member count and image url
    groupsList.forEach(group => {
        let count = 0;
        group.Memberships.forEach(member => {
            if (member) {
                count++
                group.numMembers = count
            }
        })
        if (!group.Memberships.length) {
            group.numMembers = 0;
        }

        group.GroupImages.forEach(image => {
            //console.log('groupid', group.id, image.groupId)
            if (image.groupId == group.id && image.preview == true) {
                group.previewImage = image.url
            }
        })
        if (!group.previewImage) {
            group.previewImage = 'No group image found'
        }
        delete group.GroupImages
        delete group.Memberships
    })
    let Groups = { "Groups": groupsList }
    return res.json(Groups)

})


// GET details of a group from an id
router.get('/:groupId', async (req, res, next) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId, {
        include: [
            {
                model: Membership
            },
            {
                model: GroupImage.scope('defaultScope'),
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'groupId']
                }
            },
            {
                model: User.scope(['defaultScope', 'currentUser']),
                as: 'Organizer'
            },
            {
                model: Venue,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }]
    })

    if (!group) {
        const err = new Error("Group couldn't be found")
        err.status = 404
        next(err)
    }
    let count = 0;

    let jsonGroup = group.toJSON()

    jsonGroup.Memberships.forEach(member => {
        if (member) {
            count++
            jsonGroup.numMembers = count
        }
    })
    if (!jsonGroup.Memberships.length) {
        jsonGroup.numMembers = 0;
    }

    delete jsonGroup.Memberships

    return res.json(jsonGroup)
})

// GET all groups
router.get('/', async (req, res) => {
    const groups = await Group.findAll({

        include: [
            {
                model: Membership
            },
            {
                model: GroupImage
            }]
    })
    console.log('Groups', groups)
    let groupsList = []

    groups.forEach(group => {
        groupsList.push(group.toJSON())
    })

    groupsList.forEach(group => {
        let count = 0;
        group.Memberships.forEach(member => {
            if (member) {
                count++
                group.numMembers = count
            }
        })
        if (!group.Memberships.length) {
            group.numMembers = 0;
        }

        group.GroupImages.forEach(image => {
            //console.log('groupid', group.id, image.groupId)
            if (image.groupId == group.id && image.preview == true) {
                group.previewImage = image.url
            }
        })
        if (!group.previewImage) {
            group.previewImage = 'No group image found'
        }
        delete group.GroupImages
        delete group.Memberships
    })
    let Groups = { "Groups": groupsList }
    return res.json(Groups)
})

//PUT change the status of a membership for a group specified by id
router.put('/:groupId/membership', requireAuth, userAuthorize, async (req, res, next) => {
    const { groupId } = req.params
    const { user } = req
    const { memberId, status } = req.body
    const group = await Group.findByPk(groupId)
    console.log(group)
    const memberToChange = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: group.id
        }
    })
    if (!memberToChange) {
        const err = new Error("User couldn't be found")
        err.status = 400
        err.title = "Validation Error"
        next(err)
    }

    if (memberToChange.status == 'pending' && status == 'member') {
        await memberToChange.update({
            status: status
        })
        return res.json({
            id: memberToChange.id,
            groupId: memberToChange.groupId,
            memberId: memberToChange.userId,
            status: memberToChange.status
        })
    }
    if (memberToChange.status == 'member' && status == 'co-host' && user.id == group.organizerId) {
        await memberToChange.update({
            status: status
        })
        return res.json({
            id: memberToChange.id,
            groupId: memberToChange.groupId,
            memberId: memberToChange.userId,
            status: memberToChange.status
        })
    }
    if (status == 'pending') {
        const err = new Error("Cannot change a membership status to pending")
        err.status = 400
        err.title = 'Validation Error'
        next(err)
    }
    if (status === memberToChange.status) {
        const err = new Error(`Member already has status ${status}`)
        err.status = 400
        err.title = 'Validation Error'
        next(err)
    }

})
// PUT edit a group
router.put('/:groupId', validateGroup, userAuthorize, requireAuth, async (req, res, next) => {
    const { groupId } = req.params
    const { name, about, type, private, city, state } = req.body

    const groupToEdit = await Group.findByPk(groupId)
    await groupToEdit.update({
        name,
        about,
        type,
        private,
        city,
        state
    })
    return res.json(groupToEdit)
})

// DELETE a group
router.delete('/:groupId', userAuthorize, requireAuth, async (req, res, next) => {
    const { groupId } = req.params
    const groupToDelete = await Group.findByPk(groupId)

    await groupToDelete.destroy()
    return res.json({
        message: 'Successfully deleted'
    })
})

module.exports = router;
