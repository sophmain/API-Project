const express = require('express')

const { requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage } = require('../../db/models');

const router = express.Router();

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

    const group = await Group.findOne({
        where: {
            id: groupImage.groupId
        }
    })

    const coHost = await Membership.findOne({
        where: {
          groupId: group.id,
          status: 'co-host',
          userId: user.id
        }
      })

    if (user.id == group.organizerId || coHost){
        await groupImage.destroy()
        return res.json({
            message: 'Successfully deleted'
        })
    } else {
        const err = new Error("Must be the organizer or 'co-host' of the Group to delete an image")
        err.title = 'Forbidden'
        err.errors = ['Forbidden']
        err.status = 403
        return next(err)
    }
})


module.exports = router;
