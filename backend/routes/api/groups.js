const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//check for authentication



// Get all groups joined or organized by the current user
router.get('/current', async (req, res) => {
    
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
