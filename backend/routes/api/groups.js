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


// create a group
router.post('/', requireAuth, validateGroup, async (req, res) => {
    const { name, about, type, private, city, state } = req.body

    const newGroup = await Group.create({
        name, about, type, private, city, state
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
router.get('/current', requireAuth,async (req, res) => {
    const { user } = req
    console.log(user.id)
    const groups = await Group.findAll({
        include: [
            {
                model: Membership,
            },
            {
                model: GroupImage
            }],
        // where: {
        //     organizerId: user.id
        // }
    })
    return res.json(groups)
})
// Get all groups
router.get('/', async (req, res) => {
    const groupsObj = {}

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
        console.log(group)
        group.GroupImages.forEach(image => {
            console.log('groupid', group.id, image.groupId)
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

    groupsObj.Groups = groups

    return res.json(groupsList)
})



module.exports = router;
