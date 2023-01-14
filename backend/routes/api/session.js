const express = require('express')

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const { validateLogin } = require('../../utils/validation');

// Log out
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
});

// Restore session user- removed requireauth
router.get('/', restoreUser, (req, res) => {
    const { user } = req;

    if (user) {
        return res.json({
            user: user.toSafeObject()
        });
    } else return res.json({ user: null });
});

//Log in-signup
router.post('/', validateLogin, async (req, res, next) => {
    const { credential, password } = req.body;

    // const users = await User.findAll()


    // users.forEach(user => {
    //     if (credential === user.username){
    //         const err = new Error("User with that username already exists")
    //         err.status = 403
    //         err.message = "User already exists"
    //         next(err)
    //     }
    //     if (credential === user.email){
    //         const err = newError("User with that email already exists")
    //         err.status = 403
    //         err.message = "User already exists"
    //         next(err)
    //     }
    // });
    // if (userExist){
    //     const err = new Error("User already exists")
    //     err.status = 403
    //     err.errors = ["User with that email already exists"]
    //     return next(err)
    // }
    const user = await User.login({ credential, password});

    if (!user) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = ['The provided credentials were invalid.'];
        return next(err);
    }

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
}
);

module.exports = router;
