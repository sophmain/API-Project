const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Venue, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { route } = require('./session');

const router = express.Router();

const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .withMessage("Name must be 60 characters or less."),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more.'),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .exists({ checkFalsy: true })
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    handleValidationErrors
];

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
// User authorization middleware
const userAuthorize = async (req, res, next) =>{
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group){
        const err = new Error("Group couldn't be found")
        err.errors = `Couldn't find a group with the specified id`
        err.status = 404
        return next(err)
    }
    if (group.organizerId != user.id){
        const err = new Error('Group does not belong to this user')
        err.title= 'Forbidden request'
        err.errors= 'Forbidden request'
        err.status = 403
        return next(err)
    }
    next()
}
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

        res.json({
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
        //err.errors = ['The provided group data was invalid.'];
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
        //err.errors = ['The provided group data was invalid.'];
        return next(err);
    }
})

//GET all venues for a group specified by its id
router.get('/:groupId/venues', userAuthorize, requireAuth, async (req, res, next) => {
    const { groupId } = req.params
    const venues = await Venue.findAll({
        where: {
            groupId: groupId
        }
    })
    return res.json(venues)
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
    if (group.organizerId == user.id && !groupsList.includes(group.toJSON())) {
        groupsList.push(group.toJSON())
    }

    group.Memberships.forEach(membership => {
        if (membership.userId == user.id && membership.status == 'member' && !groupsList.includes(group.toJSON())) {
            groupsList.push(group.toJSON())
        }
    })

})
    //remove groups where member is also organizer
let groupIds = []
groupsList.forEach(group => {
    if (groupIds.includes(group.id)){
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

return res.json(groupsList)
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
                model: User.scope(['defaultScope', 'currentUser']) ,
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

    let groupsList = []
    groups.forEach(group => {
        groupsList.push(group.toJSON())
    })
    console.log(groupsList)
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
    return res.json(groupsList)
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
