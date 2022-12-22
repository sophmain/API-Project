const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Group } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
  // Create the token.
  const token = jwt.sign(
    { data: user.toSafeObject() },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie('token', token, {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax"
  });

  return token;
};

const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const { token } = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.scope('currentUser').findByPk(id);
    } catch (e) {
      res.clearCookie('token');
      return next();
    }

    if (!req.user) res.clearCookie('token');

    return next();
  });
};


// If there is no current user, return an error
const requireAuth = function (req, _res, next) {
  if (req.user) return next();

  const err = new Error('Authentication required');
  err.title = 'Authentication required';
  err.errors = ['Authentication required'];
  err.status = 401;
  return next(err);
}

// User authorization middleware
const userAuthorize = async (req, res, next) => {
  const { groupId } = req.params
  const { user } = req

  const group = await Group.findByPk(groupId)
  if (!group) {
    const err = new Error("Group couldn't be found")
    err.errors = `Couldn't find a group with the specified id`
    err.status = 404
    return next(err)
  }

  if (group.organizerId != user.id) {
    const err = new Error('Group does not belong to this user')
    err.title = 'Forbidden request'
    err.errors = 'Forbidden request'
    err.status = 403
    return next(err)
  }
  next()
}


module.exports = { setTokenCookie, restoreUser, requireAuth, userAuthorize };
