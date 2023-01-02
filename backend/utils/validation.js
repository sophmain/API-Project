// backend/utils/validation.js
const { validationResult } = require('express-validator');
const { check } = require('express-validator');
// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
//validation check to create a group

const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = validationErrors
      .array()
      .map((error) => `${error.msg}`);

    const err = Error('Bad request.');
    err.errors = errors;
    err.status = 400;
    err.title = 'Bad request.';
    next(err);
  }
  next();
};

//validate dates for event
const dateValidateEvent = async (req, res, next) => {
  const { startDate, endDate } = req.body

  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const day = currentDate.getDate()
  const month = currentDate.getMonth() + 1
  const hours = currentDate.getHours()
  const min = currentDate.getMinutes()
  const seconds = currentDate.getSeconds()
  let currentDateString = `${year}-${month}-${day} ${hours}:${min}:${seconds}`

  if (startDate < currentDateString) {
      const err = new Error("Start date must be in the future")
      err.status = 400
      err.title = 'Validation error'
      next(err)
  }
  if (endDate < startDate) {
      const err = new Error("End date is less than start date")
      err.status = 400
      err.title = 'Validation error'
      next(err)
  }
  next()
}

const validateSignup = [
    check('firstName')
        .exists({checkFalsy: true})
        .withMessage('Please provide your first name.'),
    check('lastName')
        .exists({ checkFalsy: true })
        .withMessage('Please provide your last name.'),
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
];

// will check credential and password keys and validate them
const validateLogin = [
    check('credential')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Please provide a valid email or username.'),
    check('password')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a password.'),
    handleValidationErrors
];

//validation errors for an event
const validateEvent = [
  check('venueId')
      .exists({ checkFalsy: true })
      .withMessage("Venue does not exist"),
  check('name')
      .exists({ checkFalsy: true })
      .isLength({ min: 5 })
      .withMessage("Name must be at least 5 characters"),
  check('type')
      .exists({ checkFalsy: true })
      .isIn(['Online', 'In person'])
      .withMessage("Type must be 'Online' or 'In person'"),
  check('capacity')
      .exists({ checkFalsy: true })
      .isInt()
      .withMessage("Capacity must be an integer"),
  check('price')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage("Price is invalid"),
  check('description')
      .exists({ checkFalsy: true })
      .withMessage("Description is required"),
  handleValidationErrors
]

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

const validateGroup = [
  check('name')
      .exists({ checkFalsy: true })
      .isLength({ min: 1, max: 60 })
      .withMessage("Name must be 60 characters or less."),
  check('about')
      .exists({ checkFalsy: true })
      .isLength({ min: 50 })
      .withMessage('About must be 50 characters or more.'),
  check('type')
      .exists({ checkFalsy: true })
      .isIn(['Online', 'In person'])
      .withMessage("Type must be 'Online' or 'In person'"),
  check('private')
      .exists()
      .isBoolean()
      .withMessage("Private must be a boolean"),
  check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
  check('state')
      .exists({ checkFalsy: true })
      .withMessage("State is required"),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors, dateValidateEvent, validateSignup, validateEvent, validateVenue, validateGroup, validateLogin
};
