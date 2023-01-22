const express = require('express');

const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');

const { validateSignup } = require('../../utils/validation');

const router = express.Router();


// Sign up
router.post('/', validateSignup, async (req, res, next) => {
    const { firstName, lastName, email, password, username } = req.body;
    console.log('email', email)

    const emailExists = await User.findOne({
        where: {
            email
        }
    })

    if (emailExists){
        const err = new Error("User with that email already exists")
        err.status = 403
        err.message = "User already exists"
        err.errors = ["User with that email already exists."]
        return next(err)
    }
    const usernameExists = await User.findOne({
        where: {
            username
        }
    })
    if (usernameExists){
        const err = new Error("User with that username already exists")
        err.status = 403
        err.message = "User already exists"
        err.errors = ["User with that username already exists."]
        return next(err)
    }


    const user = await User.signup({ firstName, lastName, email, username, password });
    await setTokenCookie(res, user);

    return res.json({
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username
        }
    });
});

module.exports = router;
