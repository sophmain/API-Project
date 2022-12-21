const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Venue, Event, sequelize } = require('../../db/models');
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

router.get('/', async (req, res) => {
    const events = await Event.findAll({
        include: [
            {
                model: Venue
            }]
    })
    res.json(events)
})

module.exports = router;
