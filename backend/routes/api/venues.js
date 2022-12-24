const express = require('express');

const { setTokenCookie, requireAuth, userAuthorize } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Attendance, Venue, Event, EventImage, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { route } = require('./session');
const user = require('../../db/models/user');

const router = express.Router();

// const authorizeVenueEdit = async (req, res, next) => {
//     const {venueId} = req.params
//     const venues = await Venue.findByPk(venueId)
// console.log('VENUES', venues)
//     const groups = await Group.findAll({
//         where: {
//             id: venues.groupId
//         },
//         include: {
//             model: Membership,
//             where: {
//                 status: 'co-host'
//             }
//         },
//     })
//     console.log(groups)
// }
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
    .isDecimal()
    .withMessage("Latitude is not valid"),
check('lng')
    .exists({ checkFalsy: true })
    .isDecimal()
    .withMessage("Longitute is not valid"),
handleValidationErrors
]
//PUT edit a venue specified by its id
router.put('/:venueId', requireAuth, validateVenue, async (req, res, next) => {
    const { address, city, state, lat, lng } = req.body
    const { venueId } = req.params
    const { user }= req
    const venueToEdit = await Venue.findByPk(venueId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })
    if (!venueToEdit){
        const err = new Error("Venue couldn't be found")
        err.status = 404
        next(err)
    }
    const isGroupOrganizer = await Group.findOne({
        where: {
            id: venueToEdit.groupId
        }
    })
    const isMember = await Membership.findOne({
        where: {
            groupId: isGroupOrganizer.id,
            status: 'co-host',
            userId: user.id
        }
    })
    if (user.id == isGroupOrganizer.organizerId || isMember){
        const editedVenue = await venueToEdit.update({
            address,
            city,
            state,
            lat,
            lng
        })
        const findVenue = await Venue.findByPk(editedVenue.id, {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        })

        return res.json(findVenue)
    } else {
        const err = new Error('Venue does not belong to this user')
        err.title = 'Forbidden request'
        err.errors = 'Forbidden request'
        err.status = 403
        return next(err)
    }

})



module.exports = router;
