const express = require('express');

const { setTokenCookie, requireAuth, userAuthorize } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Attendance, Venue, Event, EventImage, sequelize } = require('../../db/models');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { route } = require('./session');

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

router.put('/:venueId', requireAuth, validateVenue, async (req, res, next) => {
    const { address, city, state, lat, lng } = req.body
    const { venueId } = req.params

    const venueToEdit = await Venue.scope(['defaultScope']).findByPk(venueId)
    if (!venueToEdit){
        const err = new Error("Venue couldn't be found")
        err.status = 404
        next(err)
    }
    const editedVenue = await venueToEdit.update({
        address,
        city,
        state,
        lat,
        lng
    })

    return res.json(editedVenue)
})



module.exports = router;
