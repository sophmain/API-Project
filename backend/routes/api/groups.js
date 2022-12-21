const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//validation check to create a group
const validateGroup= [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({max:60})
        .withMessage("Name must be 60 characters or less."),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({min:50})
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
// Add image to a group
router.post('/:groupId/images', requireAuth, async (req, res, next) =>{
    const { groupId } = req.params
    const { url, preview } = req.body
    const { user } = req

    const group = await Group.findByPk(groupId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })
    console.log(group)
    if (group && group.organizerId == user.id){
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
    if (!group){
        const err = new Error("Group couldn't be found")
        err.status = 404
        return next(err);
    }
    if (group.organizerId != user.id){
        const err = new Error('Current User must be the organizer for the group');
        err.status = 400;
        return next(err);
    }

})

// create a group
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

    if (newGroup){
        res.json(newGroup)
    } else {
        const err = new Error('Validation Error');
        err.status = 400;
        //err.errors = ['The provided group data was invalid.'];
        return next(err);
    }


})
//Get all groups joined or organized by the current user
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
        console.log('GROUPPPP', group.toJSON())
        if(group.organizerId == user.id && !groupsList.includes(group.toJSON())){
            groupsList.push(group.toJSON())
            console.log('groupslist111', groupsList)
        }

        group.Memberships.forEach(membership => {
            if (membership.userId == user.id && membership.status == 'Member' && !groupsList.includes(group.toJSON())){
                groupsList.push(group.toJSON())
                console.log('groupslist2222', groupsList)
            }
        })
        console.log('includes?',groupsList.includes(group.toJSON()))
    })
    console.log('groupslist', groupsList)
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

// Get all groups
router.get('/', async (req, res) => {
    const groups = await Group.findAll({

        include: [
            {
                model: Membership,
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



module.exports = router;
