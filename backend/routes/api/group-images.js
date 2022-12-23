const express = require('express')

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, User, Attendance, Venue, Event, EventImage } = require('../../db/models');

const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const group = require('../../db/models/group');

router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { imageId } = req.params
    const { user } = req

    const groupImage = await GroupImage.findOne({
        where: {
            id: imageId
        }
    })
    if (!groupImage){
        const err = new Error("Group Image couldn't be found")
        err.status= 404
        next(err)
    }
    console.log(groupImage)
    const group = await Group.findOne({
        where: {
            id: groupImage.groupId
        }
    })
    console.log(group)
    const coHost = await Membership.findOne({
        where: {
          groupId: group.id,
          status: 'co-host',
          userId: user.id
        }
      })
      console.log(coHost)
    if (user.id == group.organizerId || coHost){
        await groupImage.destroy()
        return res.json({
            message: 'Successfully deleted'
        })
    } else {
        const err = new Error("Must be the organizer or 'co-host' of the Group to delete an image")
        err.title = 'Forbidden request'
        err.errors = 'Forbidden request'
        err.status = 403
        return next(err)
    }
})


module.exports = router;
