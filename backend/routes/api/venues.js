const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Group, Membership, Venue } = require('../../db/models');

const { validateVenue } = require('../../utils/validation');

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
        err.title = 'Forbidden'
        err.errors = 'Forbidden'
        err.status = 403
        return next(err)
    }

})



module.exports = router;
